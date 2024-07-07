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
const productSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "Your name cannot exceed 30 characters"],
    },
    price: [
        {
            party: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Party",
                required: [true, "Please select a party"],
            },
            amount: {
                type: Number,
                required: [true, "Please enter the price amount"],
            },
        },
    ],
    code: {
        type: String,
        // required: [true, "Please enter your code"],
        maxLength: [30, "Your code cannot exceed 30 characters"],
        unique: [true, "This product already exists"],
    },
    category: {
        type: String,
        enum: ["waste-paper", "fuel", "chemical", "other"],
        // required: [true, "Please enter your category"],
    },
});
productSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("here");
        this.code = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        next();
    });
});
const Product = mongoose_1.default.model("Product", productSchema);
exports.default = Product;
