"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const weightsSchema = new mongoose_1.default.Schema({
    measuredAt: {
        type: Date,
        default: Date.now(),
    },
    weight1: {
        type: Number,
        required: [true, "Please enter weight1"],
    },
    weight2: {
        type: Number,
        required: [true, "Please enter weight1"],
    },
    netWeight: {
        type: Number,
        required: [true, "Please enter your weight"],
    },
    vehicleNumber: {
        type: String,
        required: [true, "Please enter your vehicleNumber"],
        maxLength: [30, "Your vehicleNumber cannot exceed 30 characters"],
    },
    image1: {
        type: String,
        required: true,
    },
    image2: {
        type: String,
        required: true,
    },
    party: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Party",
        // required: [true, "Please select a party"],
    },
});
weightsSchema.pre("save", function (next) {
    var _a;
    this.vehicleNumber = (_a = this === null || this === void 0 ? void 0 : this.vehicleNumber) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    next();
});
// weightsSchema.pre("save", async function (next) {
//   this.vehicleNumber = this.vehicleNumber
//     .toLowerCase()
//     .trim()
//     .replace(/[^\w\s-]/g, "")
//     .replace(/[\s_-]+/g, "")
//     .replace(/^-+|-+$/g, "");
//   next();
// });
const Weights = mongoose_1.default.model("Weights", weightsSchema);
exports.default = Weights;
