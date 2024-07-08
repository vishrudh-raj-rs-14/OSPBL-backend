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
exports.processPDF = exports.uploadPDF = exports.addGradeCheckData = exports.getGradeCheckData = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const invoiceModel_1 = __importDefault(require("../models/invoiceModel"));
const voucherModel_1 = __importDefault(require("../models/voucherModel"));
const timeOfficeModal_1 = __importDefault(require("../models/timeOfficeModal"));
const productModel_1 = __importDefault(require("../models/productModel"));
const reportModel_1 = __importDefault(require("../models/reportModel"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const multerStorage = multer_1.default.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file && file.mimetype.startsWith("application/pdf")) {
        cb(null, true);
    }
    else {
        cb(new Error("Upload only PDF file"), false);
    }
};
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter,
});
const uploadPDF = upload.single('pdfFile');
exports.uploadPDF = uploadPDF;
const processPDF = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file)
        return next();
    const pdfFileName = `pdf-${Date.now()}-${req.user._id}.pdf`;
    const savePath = `dist/pdf/${pdfFileName}`;
    // Save the file
    fs_1.default.writeFile(savePath, req.file.buffer, (err) => {
        if (err) {
            return next(err);
        }
        req.body.pdfFileName = pdfFileName;
        next();
    });
}));
exports.processPDF = processPDF;
const getGradeCheckData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 30;
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);
    let voucher = yield voucherModel_1.default.find({
        date: {
            $gte: startOfDay,
            $lt: endOfDay,
        },
    })
        .sort({ date: -1 })
        .populate("party");
    res.status(200).json({
        status: "success",
        voucher,
    });
}));
exports.getGradeCheckData = getGradeCheckData;
const addGradeCheckData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { timeOfficeEntry, pdfFileName } = req.body;
    const weights = JSON.parse(req.body.weights);
    console.log(pdfFileName);
    const toRecord = yield timeOfficeModal_1.default.findById(timeOfficeEntry);
    const party = toRecord === null || toRecord === void 0 ? void 0 : toRecord.party;
    const Items = weights;
    const vehicleNumber = toRecord === null || toRecord === void 0 ? void 0 : toRecord.vehicleNumber;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    if (!party || !vehicleNumber || !Items) {
        res.status(400).json({
            status: "fail",
            message: "party, vehicleNumber, Items are required",
        });
        return;
    }
    const itemListTemp = Items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        return (_a = (yield productModel_1.default.findById(item.materialId))) === null || _a === void 0 ? void 0 : _a.code;
    }));
    const itemList = yield Promise.all(itemListTemp);
    const itemsWithPricePromise = Items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        // console.log(item);
        const unitPrice = (_c = (_b = (yield productModel_1.default.findById(item.materialId))) === null || _b === void 0 ? void 0 : _b.price) === null || _c === void 0 ? void 0 : _c.find((price) => String(price.party) == String(party));
        return Object.assign(Object.assign({}, item), { unitPrice: unitPrice === null || unitPrice === void 0 ? void 0 : unitPrice.amount, netPrice: (unitPrice === null || unitPrice === void 0 ? void 0 : unitPrice.amount) * (item.firstWeight - item.secondWeight), priceAssigned: unitPrice ? true : false });
    }));
    const itemsWithPrice = yield Promise.all(itemsWithPricePromise);
    for (let i = 0; i < itemsWithPrice.length; i++) {
        if (!itemsWithPrice[i].priceAssigned) {
            res.status(400).json({
                status: "fail",
                message: "price not assigned for item",
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
        report: pdfFileName,
        Items: itemsWithPrice.map((item) => {
            return {
                weight: item.firstWeight - item.secondWeight,
                netPrice: item.netPrice,
                unitPrice: item.unitPrice,
                loss: item.loss,
                item: item.materialId,
                remarks: item.remarks
            };
        }),
        totalPurchase,
        balanceAmount: totalPurchase,
    });
    // const modifiedItems = Items.map((item: any) => {
    //   const { unitPrice, netPrice, ...rest } = item;
    //   return rest;
    // });
    const voucher = yield voucherModel_1.default.create({
        party: party,
        vehicleNumber,
        report: pdfFileName,
        Items: Items.map((item) => {
            return {
                weight: item.firstWeight - item.secondWeight,
                loss: item.loss,
                item: item.materialId,
                remarks: item.remarks
            };
        }),
    });
    res.status(201).json({
        status: "success",
        // invoice,
        voucher,
    });
}));
exports.addGradeCheckData = addGradeCheckData;
