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
exports.gettimeOfficeRecordsOfDay = exports.deletetimeOffice = exports.updatetimeOffice = exports.createtimeOffice = exports.gettimeOfficebyId = exports.getAlltimeOffices = void 0;
const partyModel_1 = __importDefault(require("../models/partyModel"));
const timeOfficeModal_1 = __importDefault(require("../models/timeOfficeModal"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const getAlltimeOffices = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 30;
    let timeOfficeRecords = timeOfficeModal_1.default
        .find({})
        .sort({ date: -1 })
        .populate('party');
    if (limit != -1) {
        timeOfficeRecords = timeOfficeRecords.limit(limit);
    }
    timeOfficeRecords = yield timeOfficeRecords;
    res.status(200).json({
        status: 'success',
        timeOfficeRecords,
    });
}));
exports.getAlltimeOffices = getAlltimeOffices;
const gettimeOfficeRecordsOfDay = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = parseInt(req.query.limit) || 30;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    let timeOfficeRecords = timeOfficeModal_1.default
        .find({
        date: {
            $gte: startOfDay,
            $lt: endOfDay,
        },
        vehicleStillIn: {
            $ne: false,
        }
    })
        .sort({ date: -1 })
        .populate('party');
    if (limit != -1) {
        timeOfficeRecords = timeOfficeRecords.limit(limit);
    }
    timeOfficeRecords = yield timeOfficeRecords;
    res.status(200).json({
        status: 'success',
        timeOfficeRecords,
    });
}));
exports.gettimeOfficeRecordsOfDay = gettimeOfficeRecordsOfDay;
const gettimeOfficebyId = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        res.status(400).json({
            status: 'fail',
            message: 'timeOffice id not provided',
        });
        return;
    }
    const timeOfficeRecord = yield timeOfficeModal_1.default
        .findById(req.params.id)
        .populate('party')
        .populate('product');
    if (!timeOfficeRecord) {
        res.status(404).json({
            status: 'fail',
            message: 'timeOffice record not found',
        });
        return;
    }
    res.status(200).json({
        status: 'success',
        timeOfficeRecord,
    });
}));
exports.gettimeOfficebyId = gettimeOfficebyId;
const createtimeOffice = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { party, vehicleNumber, category, description } = req.body;
    console.log(category);
    const partyRecord = yield partyModel_1.default.findById(party);
    if (!partyRecord) {
        res.status(404).json({
            status: 'fail',
            message: 'party record not found',
        });
        return;
    }
    const timeOfficeRecord = yield timeOfficeModal_1.default.create({
        party,
        vehicleNumber,
        category,
        description,
    });
    res.status(201).json({
        status: 'success',
        timeOfficeRecord,
    });
}));
exports.createtimeOffice = createtimeOffice;
const updatetimeOffice = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { party, vehicleNumber, category, description } = req.body;
    if (!req.params.id) {
        res.status(400).json({
            status: 'fail',
            message: 'timeOffice id not provided',
        });
        return;
    }
    const timeOfficeRecord = yield timeOfficeModal_1.default.findById(req.params.id);
    if (!timeOfficeRecord) {
        res.status(404).json({
            status: 'fail',
            message: 'timeOffice record not found',
        });
        return;
    }
    timeOfficeRecord.party = party;
    timeOfficeRecord.vehicleNumber = vehicleNumber;
    timeOfficeRecord.category = category;
    timeOfficeRecord.description = description;
    yield timeOfficeRecord.save();
    res.status(200).json({
        status: 'success',
        timeOfficeRecord,
    });
}));
exports.updatetimeOffice = updatetimeOffice;
const deletetimeOffice = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.params.id) {
        res.status(400).json({
            status: 'fail',
            message: 'timeOffice id not provided',
        });
        return;
    }
    const timeOfficeRecord = yield timeOfficeModal_1.default.findByIdAndDelete(req.params.id);
    res.status(200).json({
        status: 'success',
        timeOfficeRecord,
    });
}));
exports.deletetimeOffice = deletetimeOffice;
