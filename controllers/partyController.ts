import Party from "../models/partyModel";
import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel";
import TimeOffice from "../models/timeOfficeModal";

const getAllParties = expressAsyncHandler(async (req, res) => {
  const { partyName, gstNo, mobileNo } = req.query;
  const filter: any = {};

  if (partyName) {
    filter.partyName = { $regex: partyName, $options: "i" };
  }

  if (gstNo) {
    filter.gstNo = { $regex: gstNo, $options: "i" };
  }

  if (mobileNo) {
    filter.mobileNo = { $regex: mobileNo, $options: "i" };
  }

  const parties = await Party.find(filter);
  res.status(200).json({
    status: "success",
    parties,
  });
});

const getPartybyId = expressAsyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      status: "fail",
      message: "Party id not provided",
    });
    return;
  }

  const party = await Party.findById(req.params.id);
  if (!party) {
    res.status(404).json({
      status: "fail",
      message: "Party not found",
    });
    return;
  }
  res.status(200).json({
    status: "success",
    party,
  });
});

const createParty = expressAsyncHandler(async (req, res) => {
  const { partyName, gstNo, mobileNo, address, bankDetails } = req.body;
  const party = await Party.create({
    partyName,
    gstNo,
    mobileNo,
    address,
    bankDetails,
  });
  res.status(201).json({
    status: "success",
    party,
  });
});

const updateParty = expressAsyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      status: "fail",
      message: "Party id not provided",
    });
    return;
  }
  const { partyName, gstNo, mobileNo, address, bankDetails } = req.body;
  const party = await Party.findByIdAndUpdate(
    req.params.id,
    { partyName, gstNo, mobileNo, address, bankDetails },
    { new: true, runValidators: true }
  );
  res.status(200).json({
    status: "success",
    party,
  });
});

const deleteParty = expressAsyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      status: "fail",
      message: "Party id not provided",
    });
    return;
  }
  const products = await Product.find({
    price: { $elemMatch: { party: req.params.id } },
  });
  const updatedProducts = products.map(async (product) => {
    await Product.findByIdAndUpdate(
      product._id,
      { $pull: { price: { party: req.params.id } } },
      { new: true, runValidators: true }
    );
  });
  await Promise.all(updatedProducts);
  await TimeOffice.deleteMany({ party: req.params.id });
  const party = await Party.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    party,
  });
});

export { getAllParties, getPartybyId, createParty, updateParty, deleteParty };
