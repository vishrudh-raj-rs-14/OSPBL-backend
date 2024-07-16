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
exports.getInvoice = exports.getAllInvoices = exports.getAllPayments = exports.getInvoiceForAccountant = exports.createPayment = void 0;
const accountantModel_1 = __importDefault(require("../models/accountantModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const invoiceModel_1 = __importDefault(require("../models/invoiceModel"));
const partyModel_1 = __importDefault(require("../models/partyModel"));
const reportModel_1 = __importDefault(require("../models/reportModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const productModel_1 = __importDefault(require("../models/productModel"));
const getInvoiceForAccountant = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const invoice = yield invoiceModel_1.default.find({
        balanceAmount: { $gt: 1 },
    })
        .sort({
        date: -1,
    })
        .populate("soldBy", "partyName");
    res.status(200).json({
        status: "success",
        invoice,
    });
}));
exports.getInvoiceForAccountant = getInvoiceForAccountant;
const getInvoice = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const invoice = yield invoiceModel_1.default.findById(id).populate("soldBy").populate({
        path: 'Items.item', // Populate the item field inside Items array
        model: 'Product',
    });
    res.status(200).json({
        status: "success",
        invoice,
    });
}));
exports.getInvoice = getInvoice;
const getAllInvoices = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const invoices = yield invoiceModel_1.default.find({})
        .sort({
        date: -1,
    })
        .populate("soldBy", "partyName");
    res.status(200).json({
        status: "success",
        invoice: invoices,
    });
}));
exports.getAllInvoices = getAllInvoices;
const getAllPayments = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payments = yield accountantModel_1.default.find({}).populate({
        path: "invoice",
        populate: {
            path: "soldBy",
            select: "partyName",
        },
    });
    res.status(200).json({
        status: "success",
        payments,
    });
}));
exports.getAllPayments = getAllPayments;
const createPayment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { invoice, checkID, checkAmount, checkDate } = req.body;
    if (invoice == null ||
        checkID == null ||
        checkAmount == null ||
        checkDate == null) {
        res.status(400).json({
            status: "fail",
            message: "Please provide all the fields",
        });
        return;
    }
    const objectId = new mongoose_1.default.Types.ObjectId(invoice);
    const invoiceTemp = yield invoiceModel_1.default.findById(objectId);
    if (!invoiceTemp) {
        res.status(400).json({
            status: "fail",
            message: "Invoice not found",
        });
        return;
    }
    const Items = invoiceTemp.Items;
    const itemListTemp = Items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        // console.log(item);
        return (_a = (yield productModel_1.default.findById(item.item))) === null || _a === void 0 ? void 0 : _a.name;
    }));
    const itemList = yield Promise.all(itemListTemp);
    const party = yield partyModel_1.default.findById(invoiceTemp === null || invoiceTemp === void 0 ? void 0 : invoiceTemp.soldBy).select("partyName");
    const invoices = yield invoiceModel_1.default.find({ soldBy: invoiceTemp === null || invoiceTemp === void 0 ? void 0 : invoiceTemp.soldBy });
    const currentBalance = invoiceTemp.balanceAmount;
    const balanceAmount = Number(currentBalance) - Number(checkAmount);
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    yield reportModel_1.default.create({
        Items: itemList,
        party,
        debit: 0,
        credit: checkAmount,
        date: checkDate,
    });
    yield invoiceModel_1.default.findByIdAndUpdate(invoice, {
        balanceAmount,
    });
    const newPayment = yield accountantModel_1.default.create({
        invoice,
        checkID,
        checkAmount,
        checkDate,
    });
    res.status(201).json({
        status: "success",
        newPayment,
    });
}));
exports.createPayment = createPayment;
