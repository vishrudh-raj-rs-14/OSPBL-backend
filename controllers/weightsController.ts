import Weights from "../models/weightsModel";
import expressAsyncHandler from "express-async-handler";
import multer from "multer";
import { Request, Response } from "express";

import Jimp from "jimp";
import sharp from "sharp";

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  if (file && file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Upload only image file"), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter as any,
});

const uploadPhotos = upload.array("images", 2);

const processImages = expressAsyncHandler(async (req: any, res, next) => {
  if (!req.files) return next();
  let fileNames: any = [null, null];
  let processed: any = req.files;
  await Promise.all(
    processed.map(async (ele: any, i: number) => {
      const fileName = `weight-${Date.now()}-${i}.jpg`;
      await sharp(processed[i].buffer)
        .resize(500, 500)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/weightBridge/${fileName}`);

      fileNames[i] = fileName;
    })
  );
  req.body.fileNames = fileNames;
  next();
});

const createWeights = expressAsyncHandler(async (req: any, res: any) => {
  const { vehicleNumber, party, weight1, weight2, netWeight } = req.body;
  if (!vehicleNumber || !party || !weight1 || !weight2 || !netWeight) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  if (
    !req.body.fileNames ||
    req.body.fileNames.length != 2 ||
    req.body.fileNames[0] == undefined ||
    req.body.fileNames[1] == undefined
  ) {
    return res.status(400).json({
      message: "Both images are required",
    });
  }
  const measuredAt = new Date();

  // Create a new Weights document
  const weights = await Weights.create({
    measuredAt,
    weight1,
    weight2,
    netWeight,
    vehicleNumber,
    party,
    image1: req.body.fileNames[0],
    image2: req.body.fileNames[1],
  });

  res.status(201).json({ message: "Weights created successfully", weights });
});

const getAllWeights = expressAsyncHandler(async (req, res) => {
  const weights = await Weights.find();
  res.status(200).json(weights);
});

const getWeightsRecordsOfDay = expressAsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 30;
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  let weightsRecords: any = Weights.find({
    measuredAt: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  })
    .sort({ measuredAt: -1 })
    .populate("party");
  if (limit != -1) {
    weightsRecords = weightsRecords.limit(limit);
  }
  weightsRecords = await weightsRecords;
  res.status(200).json({
    status: "success",
    weightsRecords,
  });
});

const deleteWeights = expressAsyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      status: "fail",
      message: "Weights id not provided",
    });
    return;
  }

  const weightsRecord = await Weights.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    weightsRecord,
  });
});

const deleteAllWeights = expressAsyncHandler(async (req, res) => {
  const weightsRecord = await Weights.deleteMany({});
  res.status(200).json({
    status: "success",
    weightsRecord,
  });
});

export {
  getAllWeights,
  getWeightsRecordsOfDay,
  createWeights,
  deleteWeights,
  deleteAllWeights,
  uploadPhotos,
  processImages,
};
