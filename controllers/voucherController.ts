import Voucher from '../models/voucherModel';
import expressAsyncHandler from 'express-async-handler';
import Report from '../models/reportModel';
import Invoice from '../models/invoiceModel';
import Product from '../models/productModel';
import TimeOffice from '../models/timeOfficeModal';
import path from 'path';

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
  let vouchers: any = Voucher.find(filter).sort({ date: -1 }).populate('party');
  if (limit != -1) {
    vouchers = vouchers.limit(limit);
  }
  vouchers = await vouchers;
  res.status(200).json({
    status: 'success',
    vouchers,
  });
});

const getFile = expressAsyncHandler(async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(
    process.env.PATH_TO_PDF || './public/pdf',
    filename
  );

  // Check if the file exists
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

const getVoucher = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      status: 'fail',
      message: 'id not provided',
    });
    return;
  }
  const voucher = await Voucher.findById(id).populate('party').populate({
    path: 'Items.item', // Populate the item field inside Items array
    model: 'Product',
  });
  res.status(200).json({
    status: 'success',
    voucher,
  });
});

const getVouchersofDay = expressAsyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit as string) || 30;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const vehiclesIn = await TimeOffice.find({
    date: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
    vehicleStillIn: {
      $ne: false,
    },
  });

  let voucher: any = await Voucher.find({
    date: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  })
    .sort({ date: -1 })
    .populate('party');

  voucher = voucher.filter((voucher: any) => {
    return vehiclesIn.find((vehicleIn: any) => {
      return (
        vehicleIn.vehicleNumber.toLowerCase() ==
          voucher.vehicleNumber.toLowerCase() &&
        String(vehicleIn.party) == String(voucher.party._id)
      );
    });
  });

  res.status(200).json({
    status: 'success',
    voucher,
  });
});

const createVoucher = expressAsyncHandler(async (req, res) => {
  const { party, vehicleNumber, Items } = req.body;
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  if (!party || !vehicleNumber || !Items) {
    res.status(400).json({
      status: 'fail',
      message: 'party, vehicleNumber, Items are required',
    });
    return;
  }

  const itemList = Items.map(
    (item: { item: { name: string } }) => item.item.name
  );

  const itemsWithPricePromise = Items.map(async (item: any) => {
    const unitPrice = (await Product.findById(item.item.id))?.price?.find(
      (price: any) => price.party == party
    );
    return {
      ...item,
      unitPrice: unitPrice?.amount,
      netPrice: (unitPrice?.amount as number) * item.weight,
      priceAssigned: unitPrice ? true : false,
    };
  });
  const itemsWithPrice = await Promise.all(itemsWithPricePromise);
  for (let i = 0; i < itemsWithPrice.length; i++) {
    if (!itemsWithPrice[i].priceAssigned) {
      res.status(400).json({
        status: 'fail',
        message: 'price not assigned for item',
      });
      return;
    }
  }
  const totalPurchase = itemsWithPrice.reduce((acc: number, item: any) => {
    return acc + item.netPrice;
  }, 0);

  await Report.create({
    Items: itemList,
    party: party,
    debit: totalPurchase,
    credit: 0,
    date,
  });

  const invoice = await Invoice.create({
    soldBy: party,
    vehicleNumber,
    Items: itemsWithPrice.map((item: any) => {
      return { ...item, item: item.item.name };
    }),
    totalPurchase,
    balanceAmount: totalPurchase,
  });
  const modifiedItems = Items.map((item: any) => {
    const { unitPrice, netPrice, ...rest } = item;
    return rest;
  });

  const voucher = await Voucher.create({
    party: party,
    vehicleNumber,
    Items: Items.map((item: any) => {
      return { ...item, item: item.item.name };
    }),
  });
  res.status(201).json({
    status: 'success',
    // invoice,
    voucher,
  });
});

const deleteVoucher = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      status: 'fail',
      message: 'id not provided',
    });
    return;
  }
  const voucher = await Voucher.findByIdAndDelete(id);
  res.status(200).json({
    status: 'success',
    voucher,
  });
});

const vehicleLeft = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({
      status: 'fail',
      message: 'id not provided',
    });
    return;
  }
  const today = new Date(); // Get current date
  today.setHours(0, 0, 0, 0); // Set time to 00:00:00:00

  const voucher = await Voucher.findById(id);
  const timeOfficeRecord = await TimeOffice.find({
    vehicleNumber: voucher?.vehicleNumber,
    party: voucher?.party,
    vehicleStillIn: true,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
    },
  }).sort({ date: -1 });

  if (timeOfficeRecord.length == 0) {
    res.status(400).json({
      status: 'fail',
      message: 'vehicle already left',
    });
    return;
  }

  const tempOfficeRecord = await TimeOffice.findByIdAndUpdate(
    timeOfficeRecord[0]._id,
    {
      vehicleStillIn: false,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: 'success',
    timeOfficeRecord,
  });
});

export {
  getAllVouchers,
  createVoucher,
  deleteVoucher,
  getVouchersofDay,
  vehicleLeft,
  getVoucher,
  getFile,
};
