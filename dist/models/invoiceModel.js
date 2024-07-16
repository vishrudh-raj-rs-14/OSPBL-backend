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
const mongoose_1 = __importDefault(require("mongoose"));
const Counter_1 = __importDefault(require("./Counter"));
const invoiceSchema = new mongoose_1.default.Schema({
    invoiceNo: {
        type: Number,
        required: [true, "Please provide invoice Number"]
    },
    date: {
        type: Date,
        default: Date.now(),
    },
    totalPurchase: {
        type: Number,
        required: [true, 'Please enter your totalPurchase'],
    },
    soldBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Party',
        required: [true, 'Please select a party'],
    },
    vehicleNumber: {
        type: String,
        required: [true, 'Please enter your vehicleNumber'],
        maxLength: [30, 'Your vehicleNumber cannot exceed 30 characters'],
    },
    totalAmountAfterTax: {
        type: Number,
        required: [true, 'Please enter your totalAmountAfterTax'],
    },
    balanceAmount: {
        type: Number,
    },
    Items: [
        {
            item: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'Please select a product'],
            },
            netPrice: {
                type: Number,
                required: [true, 'Please enter the price amount'],
            },
            remarks: {
                type: String,
                default: '',
            },
            unitPrice: {
                type: Number,
                required: [true, 'Please enter the unit amount'],
            },
            weight: {
                type: Number,
                required: [true, 'Please enter the weight'],
            },
            loss: {
                type: Number,
                default: 0,
            },
        },
    ],
});
invoiceSchema.pre('save', function (next) {
    var _a;
    this.vehicleNumber = (_a = this.vehicleNumber) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    next();
});
invoiceSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!this.isNew) {
                return next();
            }
            const counter = yield Counter_1.default.findByIdAndUpdate({ model: 'invoice' }, { $inc: { seq: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true });
            this.invoiceNo = counter.seq;
            next();
        }
        catch (err) {
            next(err);
        }
    });
});
const Invoice = mongoose_1.default.model('Invoice', invoiceSchema);
exports.default = Invoice;
