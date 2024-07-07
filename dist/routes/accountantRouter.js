"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const accountantController_1 = require("../controllers/accountantController");
const userController_1 = require("../controllers/userController");
const accountantRouter = express_1.default.Router();
accountantRouter.post("/", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "ACCOUNTANT"), accountantController_1.createPayment);
accountantRouter.get("/", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "ACCOUNTANT"), accountantController_1.getAllPayments);
accountantRouter.get("/invoice", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "ACCOUNTANT"), accountantController_1.getInvoiceForAccountant);
accountantRouter.get("/invoice/all", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "ACCOUNTANT"), accountantController_1.getAllInvoices);
accountantRouter.get("/invoice/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "ACCOUNTANT"), accountantController_1.getInvoice);
exports.default = accountantRouter;
