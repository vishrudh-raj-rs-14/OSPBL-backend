import express from "express";
import {
  createPayment,
  getInvoiceForAccountant,
  getAllPayments,
} from "../controllers/accountantController";
import { protect, restricTo } from "../controllers/userController";
const accountantRouter = express.Router();

accountantRouter.post(
  "/",
  // protect,
  // restricTo("ADMIN", "ACCOUNTANT"),
  createPayment
);
accountantRouter.get(
  "/",
  // protect,
  // restricTo("ADMIN", "ACCOUNTANT"),
  getAllPayments
);
accountantRouter.get(
  "/invoice",
  // protect,
  // restricTo("ADMIN", "ACCOUNTANT"),
  getInvoiceForAccountant
);

export default accountantRouter;
