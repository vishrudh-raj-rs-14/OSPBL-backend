"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const gridFSFilesSchema = new mongoose_1.default.Schema({
    filename: {
        type: String,
    },
    contentType: {
        type: String,
    },
    size: {
        type: Number,
    },
    uploadDate: {
        type: Date,
    },
    url: {
        type: String,
    },
});
const Gridfs = mongoose_1.default.model("Gridfs", gridFSFilesSchema);
exports.default = Gridfs;
