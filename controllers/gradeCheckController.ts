import expressAsyncHandler from "express-async-handler";
import Invoice from "../models/invoiceModel";
import Voucher from "../models/voucherModel";
import TimeOffice from "../models/timeOfficeModal";
import Product from "../models/productModel";
import Report from "../models/reportModel";
import multer from "multer";
import path from "path";
import fs from 'fs'
import { del, list, put } from "@vercel/blob"; 
import { CGST, SGST } from "../config";
import Counter from "../models/Counter";

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  if (file && file.mimetype.startsWith('application/pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Upload only PDF file'), false);
  }
};
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: multerFilter as any,
});

const uploadPDF = upload.array('pdfFile');

const processPDF = expressAsyncHandler(async (req: any, res, next) => {
  if (!req.files || req.files.length == 0) return next();
  const files = req.files;
  req.body.pdfFiles = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const pdfFileName = `pdf-${Date.now()}-${req.user._id}-${i + 1}.pdf`;
    const blob = await put(pdfFileName, file.buffer, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
      access: 'public',
    });
    req.body.pdfFiles.push({ pdfFileName, blob });
  }
  // const savePath = path.join((process.env.PATH_TO_PDF || './public/pdf'), pdfFileName);
  next();
});

function sortByUploadedAtDesc(array : any) {
    array = array.map((ele:any)=>{
        return {
            ...ele,
            uploadedAt: new Date(ele.uploadedAt)
        }
    
    })
    return array.sort((a:any, b:any) => {
        return new Date(b.uploadedAt) > new Date(a.uploadedAt);
    });
}


const deleteAllBlob = expressAsyncHandler(async (req, res) => {
    const listOfBlobs = await list({
        limit: 1000,
      });

    const final = sortByUploadedAtDesc(listOfBlobs.blobs).slice(0,10);

    if (final.length > 0) {
        await del(final.map((blob:any) => blob.url));
      }

    res.status(200).json({
        status: "success",
        final,
        });
})

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
    .populate('party');

  res.status(200).json({
    status: 'success',
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
      status: 'fail',
      message: 'party, vehicleNumber, Items are required',
    });
    return;
  }

  const itemListTemp = Items.map(async (item: any) => {
    return (await Product.findById(item.materialId))?.code;
  });

  const itemList = await Promise.all(itemListTemp);

  const itemsWithPricePromise = Items.map(async (item: any) => {
    // console.log(item);
    const unitPrice = (await Product.findById(item.materialId))?.price?.find(
      (price: any) => String(price.party) == String(party)
    );
    return {
      ...item,
      unitPrice: unitPrice?.amount,
      netPrice:
        ((unitPrice?.amount as number) * (item.firstWeight - item.secondWeight) - item.loss),
      priceAssigned: unitPrice ? true : false,
    };
  });

  const itemsWithPrice = await Promise.all(itemsWithPricePromise);
  for (let i = 0; i < itemsWithPrice.length; i++) {
    if (!itemsWithPrice[i].priceAssigned) {
      res.status(400).json({
        status: 'fail',
        message: 'price not assigned for item',
      });
      return;
    }
  }

  const totalPurchase = itemsWithPrice.reduce((acc: number, item: any) => {
    return acc + item.netPrice;
  }, 0);


  const totalAmountAfterTax = (totalPurchase*(SGST+CGST)/100)+totalPurchase;

  await Report.create({
    Items: itemList,
    party: party,
    debit: totalAmountAfterTax,
    credit: 0,
    date,
  });

  const counter = await Counter.findOneAndUpdate(
    { model: 'invoice' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  const invoice = await Invoice.create({
    soldBy: party,
    vehicleNumber,
    invoiceNo:counter.seq,
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
    status: 'success',
    // invoice,
    voucher,
  });
});




export {getGradeCheckData, addGradeCheckData, uploadPDF, processPDF, deleteAllBlob}
