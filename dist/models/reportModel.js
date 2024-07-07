"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reportSchema = new mongoose_1.default.Schema({
    party: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Party",
    },
    Items: {
        type: [String],
    },
    debit: {
        type: Number,
        required: [true, "Please enter the debit"],
    },
    date: {
        type: Date,
        required: [true, "Please enter the checkDate"],
    },
    credit: {
        type: Number,
        required: [true, "Please enter the credit"],
    },
});
const Report = mongoose_1.default.model("Report", reportSchema);
exports.default = Report;
