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
exports.testDone = exports.deleteAllBlob = exports.processPDF = exports.uploadPDF = exports.addGradeCheckData = exports.getGradeCheckData = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const invoiceModel_1 = __importDefault(require("../models/invoiceModel"));
const voucherModel_1 = __importDefault(require("../models/voucherModel"));
const timeOfficeModal_1 = __importDefault(require("../models/timeOfficeModal"));
const productModel_1 = __importDefault(require("../models/productModel"));
const reportModel_1 = __importDefault(require("../models/reportModel"));
const multer_1 = __importDefault(require("multer"));
const config_1 = require("../config");
const Counter_1 = __importDefault(require("../models/Counter"));
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load env variables as early as possible
// Validate credentials explicitly
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
if (!accessKeyId || !secretAccessKey) {
    throw new Error("Missing Cloudflare R2 credentials.");
}
const s3Client = new client_s3_1.S3Client({
    region: process.env.R2_REGION || "us-east-1", // Try using "us-east-1" instead of "auto"
    endpoint: process.env.R2_ENDPOINT ||
        "https://2a88b24b0b1d5be88f5e75910b3549e9.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
    forcePathStyle: true, // Required for Cloudflare R2
});
const R2_BUCKET = process.env.R2_BUCKET || "ospbl-data";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ||
    "https://2a88b24b0b1d5be88f5e75910b3549e9.r2.cloudflarestorage.com/ospbl-data";
// Configure multer to use memory storage for PDF uploads
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
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: multerFilter,
});
const uploadPDF = upload.array("pdfFile");
exports.uploadPDF = uploadPDF;
// Process the uploaded PDFs and store them in Cloudflare R2
const processPDF = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || req.files.length === 0)
        return next();
    const files = req.files;
    req.body.pdfFiles = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const pdfFileName = `pdf-${Date.now()}-${req.user._id}-${i + 1}.pdf`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: pdfFileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        });
        yield s3Client.send(command);
        // Construct public URLs (adjust if your bucket/object settings differ)
        const blob = {
            url: `${R2_PUBLIC_URL}/${pdfFileName}`,
            downloadUrl: `${R2_PUBLIC_URL}/${pdfFileName}`,
        };
        req.body.pdfFiles.push({ pdfFileName, blob });
    }
    next();
}));
exports.processPDF = processPDF;
// Helper function to sort blobs (objects) by their LastModified date in descending order
function sortByUploadedAtDesc(array) {
    array = array.map((ele) => {
        return Object.assign(Object.assign({}, ele), { uploadedAt: new Date(ele.LastModified) });
    });
    return array.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}
// Delete the 10 most recent objects from Cloudflare R2
const deleteAllBlob = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listCommand = new client_s3_1.ListObjectsV2Command({
        Bucket: R2_BUCKET,
        MaxKeys: 1000,
    });
    const listResponse = yield s3Client.send(listCommand);
    const blobs = listResponse.Contents || [];
    const final = sortByUploadedAtDesc(blobs).slice(0, 10);
    if (final.length > 0) {
        const deleteParams = {
            Bucket: R2_BUCKET,
            Delete: {
                Objects: final.map((blob) => ({ Key: blob.Key })),
                Quiet: false,
            },
        };
        const deleteCommand = new client_s3_1.DeleteObjectsCommand(deleteParams);
        yield s3Client.send(deleteCommand);
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
        .populate("party");
    res.status(200).json({
        status: "success",
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
        const unitPrice = (_c = (_b = (yield productModel_1.default.findById(item.materialId))) === null || _b === void 0 ? void 0 : _b.price) === null || _c === void 0 ? void 0 : _c.find((price) => String(price.party) == String(party));
        return Object.assign(Object.assign({}, item), { unitPrice: unitPrice === null || unitPrice === void 0 ? void 0 : unitPrice.amount, netPrice: (unitPrice === null || unitPrice === void 0 ? void 0 : unitPrice.amount) *
                (item.firstWeight - item.secondWeight) -
                item.loss, priceAssigned: unitPrice ? true : false });
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
    const totalAmountAfterTax = (totalPurchase * (config_1.SGST + config_1.CGST)) / 100 + totalPurchase;
    yield reportModel_1.default.create({
        Items: itemList,
        party: party,
        debit: totalAmountAfterTax,
        credit: 0,
        date,
    });
    const counter = yield Counter_1.default.findOneAndUpdate({ model: "invoice" }, { $inc: { seq: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
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
        status: "success",
        voucher,
    });
}));
exports.addGradeCheckData = addGradeCheckData;
const testDone = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        status: "success",
        message: "test done",
    });
}));
exports.testDone = testDone;
