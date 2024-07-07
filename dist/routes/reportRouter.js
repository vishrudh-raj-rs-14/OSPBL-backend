"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reportController_1 = require("../controllers/reportController");
const userController_1 = require("../controllers/userController");
const reportRouter = express_1.default.Router();
reportRouter.get("/:partyId", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), reportController_1.getReport);
exports.default = reportRouter;
