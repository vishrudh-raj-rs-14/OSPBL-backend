"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const accountantSchema = new mongoose_1.default.Schema({
    invoice: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Invoice",
        required: [true, "Please select a invoice"],
    },
    checkID: {
        type: String,
        required: [true, "Please enter the checkID"],
    },
    checkAmount: {
        type: Number,
        required: [true, "Please enter the checkAmount"],
    },
    checkDate: {
        type: Date,
        required: [true, "Please enter the checkDate"],
    },
});
const Accountant = mongoose_1.default.model("Accountant", accountantSchema);
exports.default = Accountant;
