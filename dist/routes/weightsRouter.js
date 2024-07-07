"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
exports.upload = upload;
const userController_1 = require("../controllers/userController");
const weightsController_1 = require("../controllers/weightsController");
const express_1 = __importDefault(require("express"));
const weightsRouter = express_1.default.Router();
weightsRouter.get("/", weightsController_1.getAllWeights);
weightsRouter.post("/", weightsController_1.uploadPhotos, weightsController_1.processImages, weightsController_1.createWeights);
weightsRouter.delete("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), weightsController_1.deleteWeights);
weightsRouter.delete("/all", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), weightsController_1.deleteAllWeights);
exports.default = weightsRouter;
