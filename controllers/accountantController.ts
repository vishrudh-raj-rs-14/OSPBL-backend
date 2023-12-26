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
  const objectId = new mongoose.Types.ObjectId(invoice);
  const invoiceTemp = await Invoice.findById(objectId);
  if (!invoiceTemp) {
    res.status(400).json({
      status: "fail",
      message: "Invoice not found",
    });
    return;
  }
  const Items = invoiceTemp.Items;
  const itemList = Items.map((item: { item: string }) => item.item);
  const party = await Party.findById(invoiceTemp?.soldBy).select("partyName");
  const invoices = await Invoice.find({ soldBy: invoiceTemp?.soldBy });
  const currentBalance = invoiceTemp.balanceAmount;
  const balanceAmount = Number(currentBalance) - Number(checkAmount);
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  await Report.create({
    Items: itemList,
    party,
    debit: 0,
    credit: checkAmount,
    date: checkDate,
  });
  await Invoice.findByIdAndUpdate(invoice, {
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
