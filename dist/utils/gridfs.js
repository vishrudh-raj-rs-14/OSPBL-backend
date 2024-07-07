"use strict";
// gridfs.ts
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
exports.saveToGridFS = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const stream_1 = __importDefault(require("stream"));
const saveToGridFS = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const { buffer, mimetype, originalname } = file;
    const bucket = new mongoose_1.default.mongo.GridFSBucket(mongoose_1.default.connection.db, {
        bucketName: "uploads", // Change this to your desired GridFS bucket name
    });
    const uploadStream = bucket.openUploadStream(originalname, {
        metadata: {
            mimeType: mimetype,
        },
    });
    const readableStream = new stream_1.default.PassThrough();
    readableStream.end(buffer);
    yield new Promise((resolve, reject) => {
        readableStream.pipe(uploadStream).on("finish", resolve).on("error", reject);
    });
    return uploadStream.id.toString();
});
exports.saveToGridFS = saveToGridFS;
