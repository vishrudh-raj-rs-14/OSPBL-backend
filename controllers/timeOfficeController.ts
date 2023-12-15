import Party from "../models/partyModel";
import timeOffice from "../models/timeOfficeModal";
import expressAsyncHandler from "express-async-handler";

const getAlltimeOffices = expressAsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 30;
  console.log(limit);
  let timeOfficeRecords: any = timeOffice
    .find({})
    .sort({ date: -1 })
    .populate("party");
  if (limit != -1) {
    timeOfficeRecords = timeOfficeRecords.limit(limit);
  }
  timeOfficeRecords = await timeOfficeRecords;
  res.status(200).json({
    status: "success",
    timeOfficeRecords,
  });
});

const gettimeOfficeRecordsOfDay = expressAsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 30;
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  let timeOfficeRecords: any = timeOffice
    .find({
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    })
    .sort({ date: -1 })
    .populate("party");
  if (limit != -1) {
    timeOfficeRecords = timeOfficeRecords.limit(limit);
  }
  timeOfficeRecords = await timeOfficeRecords;
  res.status(200).json({
    status: "success",
    timeOfficeRecords,
  });
});

const gettimeOfficebyId = expressAsyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      status: "fail",
      message: "timeOffice id not provided",
    });
    return;
  }

  const timeOfficeRecord = await timeOffice
    .findById(req.params.id)
    .populate("party")
    .populate("product");
  if (!timeOfficeRecord) {
    res.status(404).json({
      status: "fail",
      message: "timeOffice record not found",
    });
    return;
  }
  res.status(200).json({
    status: "success",
    timeOfficeRecord,
  });
});

const createtimeOffice = expressAsyncHandler(async (req, res) => {
  const { party, vehicleNumber } = req.body;
  const partyRecord = await Party.findById(party);
  if (!partyRecord) {
    res.status(404).json({
      status: "fail",
      message: "party record not found",
    });
    return;
  }
  const timeOfficeRecord = await timeOffice.create({
    party,
    vehicleNumber,
  });
  res.status(201).json({
    status: "success",
    timeOfficeRecord,
  });
});

const updatetimeOffice = expressAsyncHandler(async (req, res) => {
  const { party, vehicleNumber } = req.body;
  if (!req.params.id) {
    res.status(400).json({
      status: "fail",
      message: "timeOffice id not provided",
    });
    return;
  }
  const timeOfficeRecord = await timeOffice.findById(req.params.id);
  if (!timeOfficeRecord) {
    res.status(404).json({
      status: "fail",
      message: "timeOffice record not found",
    });
    return;
  }
  timeOfficeRecord.party = party;
  timeOfficeRecord.vehicleNumber = vehicleNumber;
  await timeOfficeRecord.save();
  res.status(200).json({
    status: "success",
    timeOfficeRecord,
  });
});

const deletetimeOffice = expressAsyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      status: "fail",
      message: "timeOffice id not provided",
    });
    return;
  }
  const timeOfficeRecord = await timeOffice.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    timeOfficeRecord,
  });
});

export {
  getAlltimeOffices,
  gettimeOfficebyId,
  createtimeOffice,
  updatetimeOffice,
  deletetimeOffice,
  gettimeOfficeRecordsOfDay,
};
