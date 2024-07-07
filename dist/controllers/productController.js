"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateManyPrices = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductbyId = exports.getAllProducts = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const productModel_1 = __importDefault(require("../models/productModel"));
const getAllProducts = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, code } = req.query;
    const filter = {};
    if (name) {
        filter.name = { $regex: name, $options: "i" };
    }
    if (code) {
        filter.code = { $regex: code, $options: "i" };
    }
    const products = yield productModel_1.default.find(filter).populate("price.party");
    res.status(200).json({
        status: "success",
        products,
    });
}));
exports.getAllProducts = getAllProducts;
const getProductbyId = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        res.status(400).json({
            status: "fail",
            message: "Product id not provided",
        });
        return;
    }
    const product = yield productModel_1.default.findById(req.params.id);
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
}));
exports.getProductbyId = getProductbyId;
const createProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, category } = req.body;
    console.log(name);
    const product = yield productModel_1.default.create({
        name,
        category,
    });
    res.status(201).json({
        status: "success",
        product,
    });
}));
exports.createProduct = createProduct;
const updateProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, category } = req.body;
    if (!req.params.id) {
        res.status(400).json({
            status: "fail",
            message: "Product id not provided",
        });
        return;
    }
    const product = yield productModel_1.default.findById(req.params.id);
    if (!product) {
        res.status(404).json({
            status: "fail",
            message: "Product not found",
        });
        return;
    }
    product.name = name;
    product.category = category;
    yield product.save();
    res.status(200).json({
        status: "success",
        product,
    });
}));
exports.updateProduct = updateProduct;
const deleteProduct = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        res.status(400).json({
            status: "fail",
            message: "Product id not provided",
        });
        return;
    }
    const productDeleted = yield productModel_1.default.findByIdAndDelete(req.params.id);
    res.status(200).json({
        status: "success",
        productDeleted,
    });
}));
exports.deleteProduct = deleteProduct;
const updateManyPrices = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prices } = req.body;
    if (!prices) {
        res.status(400).json({
            status: "fail",
            message: "No prices provided",
        });
        return;
    }
    const updatedPrices = prices.map((ele) => __awaiter(void 0, void 0, void 0, function* () {
        const { price } = ele;
        const productId = ele._id;
        console.log(productId, price, "ASasd");
        const product = yield productModel_1.default.findById(productId);
        if (product) {
            product.price = price.filter((ele) => ele.party);
            yield product.save();
        }
    }));
    yield Promise.all(updatedPrices);
    res.status(200).json({
        status: "success",
    });
}));
exports.updateManyPrices = updateManyPrices;
