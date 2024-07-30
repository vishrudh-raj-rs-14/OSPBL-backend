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
exports.deleteAllBlob = exports.processPDF = exports.uploadPDF = exports.addGradeCheckData = exports.getGradeCheckData = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const invoiceModel_1 = __importDefault(require("../models/invoiceModel"));
const voucherModel_1 = __importDefault(require("../models/voucherModel"));
const timeOfficeModal_1 = __importDefault(require("../models/timeOfficeModal"));
const productModel_1 = __importDefault(require("../models/productModel"));
const reportModel_1 = __importDefault(require("../models/reportModel"));
const multer_1 = __importDefault(require("multer"));
const blob_1 = require("@vercel/blob");
const config_1 = require("../config");
const Counter_1 = __importDefault(require("../models/Counter"));
const multerStorage = multer_1.default.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file && file.mimetype.startsWith('application/pdf')) {
        cb(null, true);
    }
    else {
        cb(new Error('Upload only PDF file'), false);
    }
};
const upload = (0, multer_1.default)({
    storage: multerStorage,
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: multerFilter,
});
const uploadPDF = upload.array('pdfFile');
exports.uploadPDF = uploadPDF;
const processPDF = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || req.files.length == 0)
        return next();
    const files = req.files;
    req.body.pdfFiles = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const pdfFileName = `pdf-${Date.now()}-${req.user._id}-${i + 1}.pdf`;
        const blob = yield (0, blob_1.put)(pdfFileName, file.buffer, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
            access: 'public',
        });
        req.body.pdfFiles.push({ pdfFileName, blob });
    }
    // const savePath = path.join((process.env.PATH_TO_PDF || './public/pdf'), pdfFileName);
    next();
}));
exports.processPDF = processPDF;
function sortByUploadedAtDesc(array) {
    array = array.map((ele) => {
        return Object.assign(Object.assign({}, ele), { uploadedAt: new Date(ele.uploadedAt) });
    });
    return array.sort((a, b) => {
        return new Date(b.uploadedAt) > new Date(a.uploadedAt);
    });
}
const deleteAllBlob = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listOfBlobs = yield (0, blob_1.list)({
        limit: 1000,
    });
    const final = sortByUploadedAtDesc(listOfBlobs.blobs).slice(0, 10);
    if (final.length > 0) {
        yield (0, blob_1.del)(final.map((blob) => blob.url));
    }
    res.status(200).json({
        status: "success",
        final,
    });
}));
exports.deleteAllBlob = deleteAllBlob;
const getGradeCheckData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 50;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    let voucher = yield voucherModel_1.default.find({
        date: {
            $gte: startOfDay,
            $lt: endOfDay,
        },
    })
        .sort({ date: -1 })
        .populate('party');
    res.status(200).json({
        status: 'success',
        voucher,
    });
}));
exports.getGradeCheckData = getGradeCheckData;
const addGradeCheckData = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { timeOfficeEntry, pdfFileName, blob } = req.body;
    const weights = JSON.parse(req.body.weights);
    const toRecord = yield timeOfficeModal_1.default.findById(timeOfficeEntry);
    const party = toRecord === null || toRecord === void 0 ? void 0 : toRecord.party;
    const Items = weights;
    const vehicleNumber = toRecord === null || toRecord === void 0 ? void 0 : toRecord.vehicleNumber;
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    if (!party || !vehicleNumber || !Items) {
        res.status(400).json({
            status: 'fail',
            message: 'party, vehicleNumber, Items are required',
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
        return Object.assign(Object.assign({}, item), { unitPrice: unitPrice === null || unitPrice === void 0 ? void 0 : unitPrice.amount, netPrice: ((unitPrice === null || unitPrice === void 0 ? void 0 : unitPrice.amount) * (item.firstWeight - item.secondWeight) - item.loss), priceAssigned: unitPrice ? true : false });
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
    const totalAmountAfterTax = (totalPurchase * (config_1.SGST + config_1.CGST) / 100) + totalPurchase;
    yield reportModel_1.default.create({
        Items: itemList,
        party: party,
        debit: totalAmountAfterTax,
        credit: 0,
        date,
    });
    const counter = yield Counter_1.default.findOneAndUpdate({ model: 'invoice' }, { $inc: { seq: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
    const invoice = yield invoiceModel_1.default.create({
        soldBy: party,
        vehicleNumber,
        invoiceNo: counter.seq,
        Items: itemsWithPrice.map((item) => {
            return {
                weight: item.firstWeight - item.secondWeight,
                netPrice: item.netPrice,
                unitPrice: item.unitPrice,
                loss: item.loss,
                item: item.materialId,
                remarks: item.remarks,
            };
        }),
        totalPurchase,
        totalAmountAfterTax,
        balanceAmount: totalAmountAfterTax,
    });
    const voucher = yield voucherModel_1.default.create({
        party: party,
        vehicleNumber,
        Items: Items.map((item, index) => {
            return {
                weight: item.firstWeight - item.secondWeight,
                loss: item.loss,
                item: item.materialId,
                remarks: item.remarks,
                report: req.body.pdfFiles[index].pdfFileName,
                reportUrl: req.body.pdfFiles[index].blob.url,
                downloadUrl: req.body.pdfFiles[index].blob.downloadUrl,
            };
        }),
    });
    res.status(201).json({
        status: 'success',
        // invoice,
        voucher,
    });
}));
exports.addGradeCheckData = addGradeCheckData;
