import expressAsyncHandler from "express-async-handler";
import Invoice from "../models/invoiceModel";
import Party from "../models/partyModel";
import Accountant from "../models/accountantModel";
import Report from "../models/reportModel";
import mongoose from "mongoose";
type objType = {
  [key: string]: {
    debit: number;
    credit: number;
    date: Date;
    party: string;
  };
};

const getReport = expressAsyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  console.log(startDate, endDate);
  const { partyId } = req.params;
  console.log(partyId);
  const partyNew = await Party.findById(partyId).select("partyName");
  if (!partyId || !startDate || !endDate) {
    res.status(400).json({
      status: "fail",
      message: "Please provide all the fields",
    });
    return;
  }

  // Convert startDate and endDate to 00:00:00 hours
  const startDateTime = new Date(String(startDate));
  startDateTime.setHours(0, 0, 0, 0);
  const endDateTime = new Date(String(endDate));
  endDateTime.setHours(23, 59, 59, 999);

  const report = await Report.find({
    party: new mongoose.Types.ObjectId(partyId),
    date: { $gte: startDateTime, $lte: endDateTime },
  }).sort({ date: 1 });
  console.log(report, "report");
  const pipeline = [
    {
      $match: {
        party: new mongoose.Types.ObjectId(partyId),
        date: { $lte: startDateTime },
      },
    },
    {
      $group: {
        _id: null,
        totalDebit: { $sum: "$debit" },
        totalCredit: { $sum: "$credit" },
      },
    },
  ];
  const pipelineFinal = [
    {
      $match: {
        party: new mongoose.Types.ObjectId(partyId),
        date: { $gte: startDateTime, $lte: endDateTime },
      },
    },
    {
      $group: {
        _id: null,
        totalDebitFinal: { $sum: "$debit" },
        totalCreditFinal: { $sum: "$credit" },
      },
    },
  ];
  const resultFinal = await Report.aggregate(pipelineFinal);

  let initialBalanceAmount;
  let finalBalanceAmount;
  const result = await Report.aggregate(pipeline);
  if (result.length > 0) {
    const { totalDebit, totalCredit } = result[0];
    initialBalanceAmount = totalDebit - totalCredit;
    console.log(totalDebit, totalCredit, initialBalanceAmount);
  } else {
    initialBalanceAmount = 0;
    console.log(initialBalanceAmount);
  }
  if (resultFinal.length > 0) {
    const { totalDebitFinal, totalCreditFinal } = resultFinal[0];
    finalBalanceAmount =
      initialBalanceAmount + totalDebitFinal - totalCreditFinal;
    console.log(totalDebitFinal, totalCreditFinal, finalBalanceAmount);
  } else {
    finalBalanceAmount = initialBalanceAmount;
  }
  res.status(200).json({
    status: "success",
    report,
    initialBalanceAmount,
    party: partyNew,
    finalBalanceAmount,
  });
});

// const initialBalance = await Report.aggregate([
//   {
//     $match: {
//       date: { $lt: startDate },
//       party: partyId,
//     },
//   },
//   {
//     $group: {
//       _id: null,
//       debitSum: { $sum: "$debit" },
//       creditSum: { $sum: "$credit" },
//     },
//   },
// ]);
// console.log(initialBalance);
// const debitSum = initialBalance[0].debitSum || 0;
// const creditSum = initialBalance[0].creditSum || 0;
// const initialBalanceAmount = debitSum - creditSum;

export { getReport };
