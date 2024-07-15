"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const voucherController_1 = require("../controllers/voucherController");
const voucherRouter = express_1.default.Router();
voucherRouter.get("/", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "GRADE-CHECKER", "SECURITY"), voucherController_1.getVouchersofDay);
voucherRouter.get('/get-pdf/:filename', userController_1.protect, (0, userController_1.restricTo)("ADMIN"), voucherController_1.getFile);
voucherRouter.get("/all", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), voucherController_1.getAllVouchers);
voucherRouter.get("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), voucherController_1.getVoucher);
voucherRouter.post("/", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "GRADE-CHECKER"), voucherController_1.createVoucher);
voucherRouter.put("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "SECURITY"), voucherController_1.vehicleLeft);
voucherRouter.delete("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), voucherController_1.deleteVoucher);
exports.default = voucherRouter;
