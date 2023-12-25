import Accountant from "../models/accountantModel";
import expressAsyncHandler from "express-async-handler";
import Invoice from "../models/invoiceModel";
import Voucher from "../models/voucherModel";
import Party from "../models/partyModel";
import Report from "../models/reportModel";
const getInvoiceForAccountant = expressAsyncHandler(async (req, res) => {
  const invoice = await Invoice.find({
    balanceAmount: { $gt: 0 },
  }).sort({
    date: -1,
  });

  res.status(200).json({
    status: "success",
    invoice,
  });
});

const createPayment = expressAsyncHandler(async (req, res) => {
  const { voucherID, checkID, checkAmount, checkDate } = req.body;

  if (
    voucherID == null ||
    checkID == null ||
    checkAmount == null ||
    checkDate == null
  ) {
    res.status(400).json({
      status: "fail",
      message: "Please provide all the fields",
    });
    return;
  }
  const voucher = await Voucher.findById(voucherID);
  const party = await Party.findById(voucher?.soldBy).select("partyName");
  const invoices = await Invoice.find({ soldBy: voucher?.soldBy });
  const totalPurchase = invoices[0]?.totalPurchase;
  const balanceAmount = totalPurchase - checkAmount;
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  await Report.create({
    party,
    debit: 0,
    credit: checkAmount,
    materials: voucher?.Items,
    date,
  });
  await Invoice.findByIdAndUpdate(invoices[0]?._id, {
    balanceAmount,
  });

  const newPayment = await Accountant.create({
    voucherID,
    checkID,
    checkAmount,
    checkDate,
  });
  res.status(201).json({
    status: "success",
    newPayment,
  });
});

export { createPayment, getInvoiceForAccountant };
