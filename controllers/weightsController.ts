import Weights from "../models/weightsModel";
import expressAsyncHandler from "express-async-handler";
import multer, { Multer } from "multer";
import { Request, Response } from "express";

import Jimp from "jimp";

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

const uploadUserPhotos = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
]);

const resizeUserPhoto = async (req: any, res: any, next: any) => {
  if (!req.files) {
    console.log("hellossssoo");
    return next();
  }

  const resizePromises = Object.keys(req.files).map(async (fieldName) => {
    const file = req.files[fieldName][0];
    file.filename = `photo-${Date.now()}.jpeg`;

    const image = await Jimp.read(file.buffer);
    await image.resize(500, 500);
    await image.quality(90);
    await image.writeAsync(`./../uploads/${file.filename}`);
    console.log("created");
  });

  await Promise.all(resizePromises);

  next();
};

const createWeights = async (req: any, res: any) => {
  try {
    console.log("hlo");

    const { weight, vehicleNumber, sentBy, image1, image2 } = req.body as {
      weight: any;
      vehicleNumber: any;
      sentBy: any;
      image1: any;
      image2: any;
    };

    if (!image1 || !image2) {
      return res.status(400).json({
        message: "Both image1 and image2 are required",
      });
    }

    const measuredAt = new Date();

    // Create a new Weights document
    const weights = await Weights.create({
      measuredAt,
      weight,
      vehicleNumber,
      sentBy,
      image1,
      image2,
    });

    res.status(201).json({ message: "Weights created successfully" }, weights);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

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
  uploadUserPhotos,
  resizeUserPhoto,
};
