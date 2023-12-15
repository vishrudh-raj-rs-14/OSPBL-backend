import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel";

type prices = {
  productId: string;
  price: [
    {
      party: string;
      amount: number;
    }
  ];
}[];

const getAllProducts = expressAsyncHandler(async (req, res) => {
  const { name, code } = req.query;
  const filter: any = {};

  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  if (code) {
    filter.code = { $regex: code, $options: "i" };
  }

  const products = await Product.find(filter).populate("price.party");
  res.status(200).json({
    status: "success",
    products,
  });
});

const getProductbyId = expressAsyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      status: "fail",
      message: "Product id not provided",
    });
    return;
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
    return;
  }
  res.status(200).json({
    status: "success",
    product,
  });
});

const createProduct = expressAsyncHandler(async (req, res) => {
  const { name } = req.body;
  console.log(name);
  const product = await Product.create({
    name,
  });
  res.status(201).json({
    status: "success",
    product,
  });
});

const updateProduct = expressAsyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!req.params.id) {
    res.status(400).json({
      status: "fail",
      message: "Product id not provided",
    });
    return;
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({
      status: "fail",
      message: "Product not found",
    });
    return;
  }
  product.name = name;
  await product.save();
  res.status(200).json({
    status: "success",
    product,
  });
});

const deleteProduct = expressAsyncHandler(async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({
      status: "fail",
      message: "Product id not provided",
    });
    return;
  }
  const productDeleted = await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    productDeleted,
  });
});

const updateManyPrices = expressAsyncHandler(async (req, res) => {
  const { prices } = req.body;
  if (!prices) {
    res.status(400).json({
      status: "fail",
      message: "No prices provided",
    });
    return;
  }
  const updatedPrices = prices.map(async (ele: any) => {
    const { productId, price } = ele;
    console.log(productId, price, "ASasd");
    const product = await Product.findById(productId);
    if (product) {
      product.price = price;
      await product.save();
    }
  });
  await Promise.all(updatedPrices);
  res.status(200).json({
    status: "success",
  });
});

export {
  getAllProducts,
  getProductbyId,
  createProduct,
  updateProduct,
  deleteProduct,
  updateManyPrices,
};
