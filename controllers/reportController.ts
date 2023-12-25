import expressAsyncHandler from "express-async-handler";
import Invoice from "../models/invoiceModel";
import Party from "../models/partyModel";
import Accountant from "../models/accountantModel";
import Report from "../models/reportModel";
type objType = {
  [key: string]: {
    debit: number;
    credit: number;
    date: Date;
    party: string;
  };
};

const getReport = expressAsyncHandler(async (req, res) => {
  const { party, startDate, endDate } = req.body;

  if (!party || !startDate || !endDate) {
    res.status(400).json({
      status: "fail",
      message: "Please provide all the fields",
    });
    return;
  }

  const initialBalance = await Report.aggregate([
    {
      $match: {
        date: { $lt: startDate },
        party: party,
      },
    },
    {
      $group: {
        _id: null,
        debitSum: { $sum: "$debit" },
        creditSum: { $sum: "$credit" },
      },
    },
  ]);

  const debitSum = initialBalance[0].debitSum || 0;
  const creditSum = initialBalance[0].creditSum || 0;
  const initialBalanceAmount = debitSum - creditSum;

  res.status(200).json({
    status: "success",
    initialBalance: initialBalanceAmount,
  });
});

export { getReport };
