import Weights from "../models/weightsModel";
import expressAsyncHandler from "express-async-handler";

const getAllWeights = expressAsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 30;
  console.log(limit);
  let weightsRecords: any = Weights.find({})
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

const createWeights = expressAsyncHandler(async (req, res) => {
  const { party, weight, vehicleNumber } = req.body;
  if (!weight || !vehicleNumber) {
    res.status(400).json({
      status: "fail",
      message: "Weight or Vehicle Number not provided",
    });
    return;
  }
  const weightsRecord = await Weights.create({
    sentBy: party,
    weight,
    vehicleNumber,
  });
  res.status(201).json({
    status: "success",
    weightsRecord,
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
};
