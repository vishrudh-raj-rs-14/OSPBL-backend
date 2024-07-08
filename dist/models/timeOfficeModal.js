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
const timeOfficeSchema = new mongoose_1.default.Schema({
    date: {
        type: Date,
        default: Date.now(),
    },
    vehicleNumber: {
        type: String,
        required: [true, "Please enter your vehicleNumber"],
        maxLength: [30, "Your vehicleNumber cannot exceed 30 characters"],
    },
    party: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Party",
        required: [true, "Please select a party"],
    },
    category: {
        type: String,
        enum: ["waste-paper", "fuel", "chemical", "other"],
        required: [true, "Please enter your category"],
        maxLength: [30, "Your category cannot exceed 30 characters"],
    },
    description: {
        type: String,
        required: [true, "Please enter your description"],
        maxLength: [200, "Your description cannot exceed 200 characters"],
    },
    vehicleStillIn: {
        type: Boolean,
        default: true,
    },
});
timeOfficeSchema.pre("save", function (next) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        this.vehicleNumber = (_e = (_d = (_c = (_b = (_a = this === null || this === void 0 ? void 0 : this.vehicleNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === null || _b === void 0 ? void 0 : _b.trim()) === null || _c === void 0 ? void 0 : _c.replace(/[^\w\s-]/g, "")) === null || _d === void 0 ? void 0 : _d.replace(/[\s_-]+/g, "")) === null || _e === void 0 ? void 0 : _e.replace(/^-+|-+$/g, "");
        next();
    });
});
timeOfficeSchema.pre("save", function (next) {
    var _a;
    this.vehicleNumber = (_a = this === null || this === void 0 ? void 0 : this.vehicleNumber) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    next();
});
const TimeOffice = mongoose_1.default.model("TimeOffice", timeOfficeSchema);
exports.default = TimeOffice;
