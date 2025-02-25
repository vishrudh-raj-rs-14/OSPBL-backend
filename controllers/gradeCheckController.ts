import expressAsyncHandler from "express-async-handler";
import Invoice from "../models/invoiceModel";
import Voucher from "../models/voucherModel";
import TimeOffice from "../models/timeOfficeModal";
import Product from "../models/productModel";
import Report from "../models/reportModel";
import multer from "multer";
import path from "path";
import fs from "fs";
import { CGST, SGST } from "../config";
import Counter from "../models/Counter";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config(); // Load env variables as early as possible

// Validate credentials explicitly
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accessKeyId || !secretAccessKey) {
  throw new Error("Missing Cloudflare R2 credentials.");
}

const s3Client = new S3Client({
  region: process.env.R2_REGION || "us-east-1", // Try using "us-east-1" instead of "auto"
  endpoint:
    process.env.R2_ENDPOINT ||
    "https://2a88b24b0b1d5be88f5e75910b3549e9.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // Required for Cloudflare R2
});
const R2_BUCKET = process.env.R2_BUCKET || "ospbl-data";
const R2_PUBLIC_URL =
  process.env.R2_PUBLIC_URL ||
  "https://2a88b24b0b1d5be88f5e75910b3549e9.r2.cloudflarestorage.com/ospbl-data";

// Configure multer to use memory storage for PDF uploads
const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  if (file && file.mimetype.startsWith("application/pdf")) {
    cb(null, true);
  } else {
    cb(new Error("Upload only PDF file"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: multerFilter as any,
});

const uploadPDF = upload.array("pdfFile");

// Process the uploaded PDFs and store them in Cloudflare R2
const processPDF = expressAsyncHandler(async (req: any, res, next) => {
  if (!req.files || req.files.length === 0) return next();
  const files = req.files;
  req.body.pdfFiles = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const pdfFileName = `pdf-${Date.now()}-${req.user._id}-${i + 1}.pdf`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: pdfFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3Client.send(command);

    // Construct public URLs (adjust if your bucket/object settings differ)
    const blob = {
      url: `${R2_PUBLIC_URL}/${pdfFileName}`,
      downloadUrl: `${R2_PUBLIC_URL}/${pdfFileName}`,
    };

    req.body.pdfFiles.push({ pdfFileName, blob });
  }
  next();
});

// Helper function to sort blobs (objects) by their LastModified date in descending order
function sortByUploadedAtDesc(array: any) {
  array = array.map((ele: any) => {
    return {
      ...ele,
      uploadedAt: new Date(ele.LastModified),
    };
  });
  return array.sort(
    (a: any, b: any) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

// Delete the 10 most recent objects from Cloudflare R2
const deleteAllBlob = expressAsyncHandler(async (req, res) => {
  const listCommand = new ListObjectsV2Command({
    Bucket: R2_BUCKET,
    MaxKeys: 1000,
  });
  const listResponse = await s3Client.send(listCommand);
  const blobs = listResponse.Contents || [];
  const final = sortByUploadedAtDesc(blobs).slice(0, 10);

  if (final.length > 0) {
    const deleteParams = {
      Bucket: R2_BUCKET,
      Delete: {
        Objects: final.map((blob: any) => ({ Key: blob.Key })),
        Quiet: false,
      },
    };
    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await s3Client.send(deleteCommand);
  }

  res.status(200).json({
    status: "success",
    final,
  });
});

const getGradeCheckData = expressAsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  let voucher: any = await Voucher.find({
    date: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  })
    .sort({ date: -1 })
    .populate("party");

  res.status(200).json({
    status: "success",
    voucher,
  });
});

const addGradeCheckData = expressAsyncHandler(async (req, res) => {
  const { timeOfficeEntry, pdfFileName, blob } = req.body;
  const weights = JSON.parse(req.body.weights);
  const toRecord = await TimeOffice.findById(timeOfficeEntry);
  const party = toRecord?.party;
  const Items = weights;
  const vehicleNumber = toRecord?.vehicleNumber;
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (!party || !vehicleNumber || !Items) {
    res.status(400).json({
      status: "fail",
      message: "party, vehicleNumber, Items are required",
    });
    return;
  }

  const itemListTemp = Items.map(async (item: any) => {
    return (await Product.findById(item.materialId))?.code;
  });

  const itemList = await Promise.all(itemListTemp);

  const itemsWithPricePromise = Items.map(async (item: any) => {
    const unitPrice = (await Product.findById(item.materialId))?.price?.find(
      (price: any) => String(price.party) == String(party)
    );
    return {
      ...item,
      unitPrice: unitPrice?.amount,
      netPrice:
        (unitPrice?.amount as number) *
          (item.firstWeight - item.secondWeight) -
        item.loss,
      priceAssigned: unitPrice ? true : false,
    };
  });

  const itemsWithPrice = await Promise.all(itemsWithPricePromise);
  for (let i = 0; i < itemsWithPrice.length; i++) {
    if (!itemsWithPrice[i].priceAssigned) {
      res.status(400).json({
        status: "fail",
        message: "price not assigned for item",
      });
      return;
    }
  }

  const totalPurchase = itemsWithPrice.reduce((acc: number, item: any) => {
    return acc + item.netPrice;
  }, 0);

  const totalAmountAfterTax =
    (totalPurchase * (SGST + CGST)) / 100 + totalPurchase;

  await Report.create({
    Items: itemList,
    party: party,
    debit: totalAmountAfterTax,
    credit: 0,
    date,
  });

  const counter = await Counter.findOneAndUpdate(
    { model: "invoice" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const invoice = await Invoice.create({
    soldBy: party,
    vehicleNumber,
    invoiceNo: counter.seq,
    Items: itemsWithPrice.map((item: any) => {
      return {
        weight: item.firstWeight - item.secondWeight,
        netPrice: item.netPrice,
        unitPrice: item.unitPrice,
        loss: item.loss,
        item: item.materialId,
        remarks: item.remarks,
      };
    }),
    totalPurchase,
    totalAmountAfterTax,
    balanceAmount: totalAmountAfterTax,
  });

  const voucher = await Voucher.create({
    party: party,
    vehicleNumber,
    Items: Items.map((item: any, index: number) => {
      return {
        weight: item.firstWeight - item.secondWeight,
        loss: item.loss,
        item: item.materialId,
        remarks: item.remarks,
        report: req.body.pdfFiles[index].pdfFileName,
        reportUrl: req.body.pdfFiles[index].blob.url,
        downloadUrl: req.body.pdfFiles[index].blob.downloadUrl,
      };
    }),
  });
  res.status(201).json({
    status: "success",
    voucher,
  });
});

const testDone = expressAsyncHandler(async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "test done",
  });
})

export {
  getGradeCheckData,
  addGradeCheckData,
  uploadPDF,
  processPDF,
  deleteAllBlob,
  testDone
};
