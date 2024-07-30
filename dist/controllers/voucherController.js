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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFile = exports.getVoucher = exports.vehicleLeft = exports.getVouchersofDay = exports.deleteVoucher = exports.createVoucher = exports.getAllVouchers = void 0;
const voucherModel_1 = __importDefault(require("../models/voucherModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const reportModel_1 = __importDefault(require("../models/reportModel"));
const invoiceModel_1 = __importDefault(require("../models/invoiceModel"));
const productModel_1 = __importDefault(require("../models/productModel"));
const timeOfficeModal_1 = __importDefault(require("../models/timeOfficeModal"));
const path_1 = __importDefault(require("path"));
const getAllVouchers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = {};
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
    const limit = parseInt(req.query.limit) || 50;
    let vouchers = voucherModel_1.default.find(filter).sort({ date: -1 }).populate('party');
    if (limit != -1) {
        vouchers = vouchers.limit(limit);
    }
    vouchers = yield vouchers;
    res.status(200).json({
        status: 'success',
        vouchers,
    });
}));
exports.getAllVouchers = getAllVouchers;
const getFile = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filename } = req.params;
    const filePath = path_1.default.join(process.env.PATH_TO_PDF || './public/pdf', filename);
    // Check if the file exists
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
}));
exports.getFile = getFile;
const getVoucher = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            status: 'fail',
            message: 'id not provided',
        });
        return;
    }
    const voucher = yield voucherModel_1.default.findById(id).populate('party').populate({
        path: 'Items.item', // Populate the item field inside Items array
        model: 'Product',
    });
    res.status(200).json({
        status: 'success',
        voucher,
    });
}));
exports.getVoucher = getVoucher;
const getVouchersofDay = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 30;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const vehiclesIn = yield timeOfficeModal_1.default.find({
        date: {
            $gte: startOfDay,
            $lt: endOfDay,
        },
        vehicleStillIn: {
            $ne: false,
        },
    });
    let voucher = yield voucherModel_1.default.find({
        date: {
            $gte: startOfDay,
            $lt: endOfDay,
        },
    })
        .sort({ date: -1 })
        .populate('party')
        .populate({
        path: 'Items.item', // Populate the item field inside Items array
        model: 'Product',
    });
    voucher = voucher.filter((voucher) => {
        return vehiclesIn.find((vehicleIn) => {
            return (vehicleIn.vehicleNumber.toLowerCase() ==
                voucher.vehicleNumber.toLowerCase() &&
                String(vehicleIn.party) == String(voucher.party._id));
        });
    });
    res.status(200).json({
        status: 'success',
        voucher,
    });
}));
exports.getVouchersofDay = getVouchersofDay;
const createVoucher = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const itemList = Items.map((item) => item.item.name);
    const itemsWithPricePromise = Items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const unitPrice = (_b = (_a = (yield productModel_1.default.findById(item.item.id))) === null || _a === void 0 ? void 0 : _a.price) === null || _b === void 0 ? void 0 : _b.find((price) => price.party == party);
        return Object.assign(Object.assign({}, item), { unitPrice: unitPrice === null || unitPrice === void 0 ? void 0 : unitPrice.amount, netPrice: (unitPrice === null || unitPrice === void 0 ? void 0 : unitPrice.amount) * item.weight, priceAssigned: unitPrice ? true : false });
    }));
    const itemsWithPrice = yield Promise.all(itemsWithPricePromise);
    for (let i = 0; i < itemsWithPrice.length; i++) {
        if (!itemsWithPrice[i].priceAssigned) {
            res.status(400).json({
                status: 'fail',
                message: 'price not assigned for item',
            });
            return;
        }
    }
    const totalPurchase = itemsWithPrice.reduce((acc, item) => {
        return acc + item.netPrice;
    }, 0);
    yield reportModel_1.default.create({
        Items: itemList,
        party: party,
        debit: totalPurchase,
        credit: 0,
        date,
    });
    const invoice = yield invoiceModel_1.default.create({
        soldBy: party,
        vehicleNumber,
        Items: itemsWithPrice.map((item) => {
            return Object.assign(Object.assign({}, item), { item: item.item.name });
        }),
        totalPurchase,
        balanceAmount: totalPurchase,
    });
    const modifiedItems = Items.map((item) => {
        const { unitPrice, netPrice } = item, rest = __rest(item, ["unitPrice", "netPrice"]);
        return rest;
    });
    const voucher = yield voucherModel_1.default.create({
        party: party,
        vehicleNumber,
        Items: Items.map((item) => {
            return Object.assign(Object.assign({}, item), { item: item.item.name });
        }),
    });
    res.status(201).json({
        status: 'success',
        // invoice,
        voucher,
    });
}));
exports.createVoucher = createVoucher;
const deleteVoucher = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            status: 'fail',
            message: 'id not provided',
        });
        return;
    }
    const voucher = yield voucherModel_1.default.findByIdAndDelete(id);
    res.status(200).json({
        status: 'success',
        voucher,
    });
}));
exports.deleteVoucher = deleteVoucher;
const vehicleLeft = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const voucher = yield voucherModel_1.default.findById(id);
    const timeOfficeRecord = yield timeOfficeModal_1.default.find({
        vehicleNumber: voucher === null || voucher === void 0 ? void 0 : voucher.vehicleNumber,
        party: voucher === null || voucher === void 0 ? void 0 : voucher.party,
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
    const tempOfficeRecord = yield timeOfficeModal_1.default.findByIdAndUpdate(timeOfficeRecord[0]._id, {
        vehicleStillIn: false,
    }, {
        new: true,
    });
    res.status(200).json({
        status: 'success',
        timeOfficeRecord,
    });
}));
exports.vehicleLeft = vehicleLeft;
