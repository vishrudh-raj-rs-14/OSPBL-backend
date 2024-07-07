"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const invoiceSchema = new mongoose_1.default.Schema({
    date: {
        type: Date,
        default: Date.now(),
    },
    totalPurchase: {
        type: Number,
        required: [true, "Please enter your totalPurchase"],
    },
    soldBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Party",
        required: [true, "Please select a party"],
    },
    vehicleNumber: {
        type: String,
        required: [true, "Please enter your vehicleNumber"],
        maxLength: [30, "Your vehicleNumber cannot exceed 30 characters"],
    },
    balanceAmount: {
        type: Number,
    },
    report: {
        type: "String"
    },
    Items: [
        {
            item: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Please select a product"],
            },
            netPrice: {
                type: Number,
                required: [true, "Please enter the price amount"],
            },
            remarks: {
                type: String,
                default: ""
            },
            unitPrice: {
                type: Number,
                required: [true, "Please enter the unit amount"],
            },
            weight: {
                type: Number,
                required: [true, "Please enter the weight"],
            },
            loss: {
                type: String,
                default: "0%",
            },
        },
    ],
});
invoiceSchema.pre("save", function (next) {
    this.vehicleNumber = this.vehicleNumber.toUpperCase();
    next();
});
const Invoice = mongoose_1.default.model("Invoice", invoiceSchema);
exports.default = Invoice;
