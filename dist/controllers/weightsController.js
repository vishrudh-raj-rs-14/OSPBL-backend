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
exports.processImages = exports.uploadPhotos = exports.deleteAllWeights = exports.deleteWeights = exports.createWeights = exports.getAllCompleteWeights = exports.getAllWeights = void 0;
const weightsModel_1 = __importDefault(require("../models/weightsModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const multer_1 = __importDefault(require("multer"));
const multerStorage = multer_1.default.memoryStorage();
const multerFilter = (req, file, cb) => {
    if (file && file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new Error('Upload only image file'), false);
    }
};
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter,
});
const uploadPhotos = upload.array('images', 2);
exports.uploadPhotos = uploadPhotos;
const processImages = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // if (!req.files) return next();
    // let fileNames: any = [null, null];
    // let processed: any = req.files;
    // await Promise.all(
    //   processed.map(async (ele: any, i: number) => {
    //     const fileName = `weight-${Date.now()}-${i}.jpg`;
    //     await sharp(processed[i].buffer)
    //       .resize(500, 500)
    //       .toFormat("jpeg")
    //       .jpeg({ quality: 90 })
    //       .toFile(`public/img/weightBridge/${fileName}`);
    //     fileNames[i] = fileName;
    //   })
    // );
    // req.body.fileNames = fileNames;
    next();
}));
exports.processImages = processImages;
const createWeights = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { vehicleNumber, party, weight1, weight2, netWeight } = req.body;
    if (!vehicleNumber || !party || !weight1 || !weight2 || !netWeight) {
        return res.status(400).json({
            message: 'All fields are required',
        });
    }
    if (!req.body.fileNames ||
        req.body.fileNames.length != 2 ||
        req.body.fileNames[0] == undefined ||
        req.body.fileNames[1] == undefined) {
        return res.status(400).json({
            message: 'Both images are required',
        });
    }
    const measuredAt = new Date();
    // Create a new Weights document
    const weights = yield weightsModel_1.default.create({
        measuredAt,
        weight1,
        weight2,
        netWeight,
        vehicleNumber,
        party,
        image1: req.body.fileNames[0],
        image2: req.body.fileNames[1],
    });
    res.status(201).json({ message: 'Weights created successfully', weights });
}));
exports.createWeights = createWeights;
const getAllWeights = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const weights = yield weightsModel_1.default.find({
        measuredAt: {
            $gte: startOfDay,
        },
    })
        .populate('party', 'partyName')
        .sort({ measuredAt: -1 });
    res.status(200).json(weights);
}));
exports.getAllWeights = getAllWeights;
const getAllCompleteWeights = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const weights = yield weightsModel_1.default.find()
        .populate('party', 'partyName')
        .sort({ measuredAt: -1 });
    res.status(200).json({
        status: 'success',
        weights,
    });
}));
exports.getAllCompleteWeights = getAllCompleteWeights;
const deleteWeights = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        res.status(400).json({
            status: 'fail',
            message: 'Weights id not provided',
        });
        return;
    }
    const weightsRecord = yield weightsModel_1.default.findByIdAndDelete(req.params.id);
    res.status(200).json({
        status: 'success',
        weightsRecord,
    });
}));
exports.deleteWeights = deleteWeights;
const deleteAllWeights = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const weightsRecord = yield weightsModel_1.default.deleteMany({});
    res.status(200).json({
        status: 'success',
        weightsRecord,
    });
}));
exports.deleteAllWeights = deleteAllWeights;
