import Weights from '../models/weightsModel';
import expressAsyncHandler from 'express-async-handler';
import multer from 'multer';
import { Request, Response } from 'express';

const multerStorage = multer.memoryStorage();

const multerFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void
) => {
  if (file && file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Upload only image file'), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter as any,
});

const uploadPhotos = upload.array('images', 2);

const processImages = expressAsyncHandler(async (req: any, res, next) => {
  // if (!req.files) return next();
  // let fileNames: any = [null, null];
  // let processed: any = req.files;
  // await Promise.all(
  //   processed.map(async (ele: any, i: number) => {
  //     const fileName = `weight-${Date.now()}-${i}.jpg`;
  //     await sharp(processed[i].buffer)
  //       .resize(500, 500)
  //       .toFormat('jpeg')
  //       .jpeg({ quality: 90 })
  //       .toFile(`public/img/weightBridge/${fileName}`);

  //     fileNames[i] = fileName;
  //   })
  // );
  // req.body.fileNames = fileNames;
  next();
});

const createWeights = expressAsyncHandler(async (req: any, res: any) => {
  const { vehicleNumber, party, weight1, weight2, netWeight } = req.body;
  if (!vehicleNumber || !party || !weight1 || !weight2 || !netWeight) {
    return res.status(400).json({
      message: 'All fields are required',
    });
  }
  if (
    !req.body.fileNames ||
    req.body.fileNames.length != 2 ||
    req.body.fileNames[0] == undefined ||
    req.body.fileNames[1] == undefined
  ) {
    return res.status(400).json({
      message: 'Both images are required',
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

  res.status(201).json({ message: 'Weights created successfully', weights });
});

const getAllWeights = expressAsyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const weights = await Weights.find({
    measuredAt: {
      $gte: startOfDay,
    },
  })
    .populate('party', 'partyName')
    .sort({ measuredAt: -1 });

  res.status(200).json(weights);
});

const getAllCompleteWeights = expressAsyncHandler(async (req, res) => {
  const weights = await Weights.find()
    .populate('party', 'partyName')
    .sort({ measuredAt: -1 });

  res.status(200).json({
    status: 'success',
    weights,
  });
});

const deleteWeights = expressAsyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      status: 'fail',
      message: 'Weights id not provided',
    });
    return;
  }

  const weightsRecord = await Weights.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: 'success',
    weightsRecord,
  });
});

const deleteAllWeights = expressAsyncHandler(async (req, res) => {
  const weightsRecord = await Weights.deleteMany({});
  res.status(200).json({
    status: 'success',
    weightsRecord,
  });
});

export {
  getAllWeights,
  getAllCompleteWeights,
  createWeights,
  deleteWeights,
  deleteAllWeights,
  uploadPhotos,
  processImages,
};
