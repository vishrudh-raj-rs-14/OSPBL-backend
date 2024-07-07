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
exports.getReport = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const partyModel_1 = __importDefault(require("../models/partyModel"));
const reportModel_1 = __importDefault(require("../models/reportModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const getReport = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = req.query;
    console.log(startDate, endDate);
    const { partyId } = req.params;
    console.log(partyId);
    const partyNew = yield partyModel_1.default.findById(partyId).select("partyName");
    if (!partyId || !startDate || !endDate) {
        res.status(400).json({
            status: "fail",
            message: "Please provide all the fields",
        });
        return;
    }
    // Convert startDate and endDate to 00:00:00 hours
    const startDateTime = new Date(String(startDate));
    startDateTime.setHours(0, 0, 0, 0);
    const endDateTime = new Date(String(endDate));
    endDateTime.setHours(23, 59, 59, 999);
    const report = yield reportModel_1.default.find({
        party: new mongoose_1.default.Types.ObjectId(partyId),
        date: { $gte: startDateTime, $lte: endDateTime },
    }).sort({ date: 1 });
    console.log(report, "report");
    const pipeline = [
        {
            $match: {
                party: new mongoose_1.default.Types.ObjectId(partyId),
                date: { $lt: startDateTime },
            },
        },
        {
            $group: {
                _id: null,
                totalDebit: { $sum: "$debit" },
                totalCredit: { $sum: "$credit" },
            },
        },
    ];
    const pipelineFinal = [
        {
            $match: {
                party: new mongoose_1.default.Types.ObjectId(partyId),
                date: { $gte: startDateTime, $lte: endDateTime },
            },
        },
        {
            $group: {
                _id: null,
                totalDebitFinal: { $sum: "$debit" },
                totalCreditFinal: { $sum: "$credit" },
            },
        },
    ];
    const resultFinal = yield reportModel_1.default.aggregate(pipelineFinal);
    let initialBalanceAmount;
    let finalBalanceAmount;
    const result = yield reportModel_1.default.aggregate(pipeline);
    if (result.length > 0) {
        const { totalDebit, totalCredit } = result[0];
        initialBalanceAmount = totalDebit - totalCredit;
        console.log(totalDebit, totalCredit, initialBalanceAmount);
    }
    else {
        initialBalanceAmount = 0;
        console.log(initialBalanceAmount);
    }
    if (resultFinal.length > 0) {
        const { totalDebitFinal, totalCreditFinal } = resultFinal[0];
        finalBalanceAmount =
            initialBalanceAmount + totalDebitFinal - totalCreditFinal;
        console.log(totalDebitFinal, totalCreditFinal, finalBalanceAmount);
    }
    else {
        finalBalanceAmount = initialBalanceAmount;
    }
    res.status(200).json({
        status: "success",
        report,
        initialBalanceAmount,
        party: partyNew,
        finalBalanceAmount,
    });
}));
exports.getReport = getReport;
