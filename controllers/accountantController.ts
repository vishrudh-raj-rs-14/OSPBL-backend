import Accountant from "../models/accountantModel";
import expressAsyncHandler from "express-async-handler";
import Invoice from "../models/invoiceModel";
import Voucher from "../models/voucherModel";
import Party from "../models/partyModel";
import Report from "../models/reportModel";
import mongoose from "mongoose";
const getInvoiceForAccountant = expressAsyncHandler(async (req, res) => {
  const invoice = await Invoice.find({
    balanceAmount: { $gt: 0 },
  })
    .sort({
      date: -1,
    })
    .populate("soldBy", "partyName");

  res.status(200).json({
    status: "success",
    invoice,
  });
});

const createPayment = expressAsyncHandler(async (req, res) => {
  const { invoice, checkID, checkAmount, checkDate } = req.body;

  if (
    invoice == null ||
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
  console.log(invoice, "voucher");
  const objectId = new mongoose.Types.ObjectId(invoice);
  const invoiceTemp = await Invoice.findById(objectId);
  console.log(invoice);
  const party = await Party.findById(invoiceTemp?.soldBy).select("partyName");
  const invoices = await Invoice.find({ soldBy: invoiceTemp?.soldBy });
  const totalPurchase = invoices[0]?.totalPurchase;
  const balanceAmount = totalPurchase - checkAmount;
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  // await Report.create({
  //   party,
  //   debit: 0,
  //   credit: checkAmount,
  //   materials: invoice?.Items,
  //   date,
  // });
  await Invoice.findByIdAndUpdate(invoices[0]?._id, {
    balanceAmount,
  });

  const newPayment = await Accountant.create({
    invoice,
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
