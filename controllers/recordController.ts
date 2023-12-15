import Record from "../models/recordModel";
import expressAsyncHandler from "express-async-handler";

const getAllRecords = expressAsyncHandler(async (req, res) => {
  const filter: any = {};
  const { party, product, date } = req.query;
  if (party) {
    filter.party = party;
  }
  if (product) {
    filter.product = product;
  }
  if (date) {
    filter.date = date;
  }
  //TODO ADD DATE RANGE FILTER

  const limit = parseInt(req.query.limit as string) || 30;
  console.log(limit);
  let records: any = Record.find(filter).sort({ date: -1 }).populate("party");
  if (limit != -1) {
    records = records.limit(limit);
  }
  records = await records;
  res.status(200).json({
    status: "success",
    records,
  });
});

const getRecordsofDay = expressAsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 30;
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  let records: any = Record.find({
    date: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  })
    .sort({ date: -1 })
    .populate("party");
  if (limit != -1) {
    records = records.limit(limit);
  }
  records = await records;
  res.status(200).json({
    status: "success",
    records,
  });
});

const createRecord = expressAsyncHandler(async (req, res) => {
  const { totalPurchase, soldBy, vehicleNumber, Items } = req.body;
  if (!totalPurchase || !soldBy || !vehicleNumber || !Items) {
    res.status(400).json({
      status: "fail",
      message: "totalPurchase, soldBy, vehicleNumber, Items not provided",
    });
    return;
  }
  const record = await Record.create({
    totalPurchase,
    soldBy,
    vehicleNumber,
    Items,
  });
  res.status(201).json({
    status: "success",
    record,
  });
});

const deleteRecord = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      status: "fail",
      message: "id not provided",
    });
    return;
  }
  const record = await Record.findByIdAndDelete(id);
  res.status(200).json({
    status: "success",
    record,
  });
});

export { getAllRecords, createRecord, deleteRecord, getRecordsofDay };
