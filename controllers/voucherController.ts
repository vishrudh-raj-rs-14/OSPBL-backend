import Voucher from "../models/voucherModel";
import expressAsyncHandler from "express-async-handler";
import Report from "../models/reportModel";
import Invoice from "../models/invoiceModel";

const getAllVouchers = expressAsyncHandler(async (req, res) => {
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

  const limit = parseInt(req.query.limit as string) || 30;
  console.log(limit);
  let vouchers: any = Voucher.find(filter).sort({ date: -1 }).populate("party");
  if (limit != -1) {
    vouchers = vouchers.limit(limit);
  }
  vouchers = await vouchers;
  res.status(200).json({
    status: "success",
    vouchers,
  });
});

const getVouchersofDay = expressAsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 30;
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  let voucher: any = Voucher.find({
    date: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  })
    .sort({ date: -1 })
    .populate("party");
  if (limit != -1) {
    voucher = voucher.limit(limit);
  }
  voucher = await voucher;
  res.status(200).json({
    status: "success",
    voucher,
  });
});

const createVoucher = expressAsyncHandler(async (req, res) => {
  const { totalPurchase, party, vehicleNumber, Items } = req.body;
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  // await Report.create({
  //   party: party.partyName,
  //   debit: totalPurchase,
  //   credit: 0,
  //   materials: Items,
  //   date,
  // });
  if (!totalPurchase || !party || !vehicleNumber || !Items) {
    res.status(400).json({
      status: "fail",
      message: "totalPurchase, soldBy, vehicleNumber, Items not provided",
    });
    return;
  }
  const invoice = await Invoice.create({
    soldBy: party,
    vehicleNumber,
    Items,
    totalPurchase,
    balanceAmount: totalPurchase,
  });
  const modifiedItems = Items.map((item: any) => {
    const { unitPrice, netPrice, ...rest } = item;
    return rest;
  });
  console.log(modifiedItems);
  const voucher = await Voucher.create({
    soldBy: party,
    vehicleNumber,
    Items: modifiedItems,
  });
  res.status(201).json({
    status: "success",
    invoice,
    voucher,
  });
});

const deleteVoucher = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      status: "fail",
      message: "id not provided",
    });
    return;
  }
  const voucher = await Voucher.findByIdAndDelete(id);
  res.status(200).json({
    status: "success",
    voucher,
  });
});

export { getAllVouchers, createVoucher, deleteVoucher, getVouchersofDay };
