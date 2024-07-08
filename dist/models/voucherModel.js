"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const voucherSchema = new mongoose_1.default.Schema({
    date: {
        type: Date,
        default: Date.now(),
    },
    party: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Party",
        required: [true, "Please select a party"],
    },
    vehicleNumber: {
        type: String,
        required: [true, "Please enter your vehicleNumber"],
        maxLength: [30, "Your vehicleNumber cannot exceed 30 characters"],
    },
    Items: [
        {
            item: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Please select a product"],
            },
            weight: {
                type: Number,
                required: [true, "Please enter the weight"],
            },
            remarks: {
                type: String,
                default: ""
            },
            loss: {
                type: Number,
                default: 0,
            }, report: {
                type: "String",
                required: [true, "Please enter your report"],
            },
            reportUrl: {
                type: "String",
                required: [true, "Please enter your report"],
            },
            downloadUrl: {
                type: String,
                required: [true, "Please enter your downloadUrl"],
            },
        },
    ],
});
voucherSchema.pre("save", function (next) {
    this.vehicleNumber = this.vehicleNumber.toUpperCase();
    next();
});
const Voucher = mongoose_1.default.model("Voucher", voucherSchema);
exports.default = Voucher;
