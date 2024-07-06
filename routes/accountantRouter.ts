import express from "express";
import {
  createPayment,
  getInvoiceForAccountant,
  getAllPayments,
  getAllInvoices,
  getInvoice,
} from "../controllers/accountantController";
import { protect, restricTo } from "../controllers/userController";
const accountantRouter = express.Router();

accountantRouter.post(
  "/",
  protect,
  restricTo("ADMIN", "ACCOUNTANT"),
  createPayment
);
accountantRouter.get(
  "/",
  protect,
  restricTo("ADMIN", "ACCOUNTANT"),
  getAllPayments
);
accountantRouter.get(
  "/invoice",
  protect,
  restricTo("ADMIN", "ACCOUNTANT"),
  getInvoiceForAccountant
);

accountantRouter.get(
  "/invoice/all",
  protect,
  restricTo("ADMIN", "ACCOUNTANT"),
  getAllInvoices
);

accountantRouter.get(
  "/invoice/:id",
  protect,
  restricTo("ADMIN", "ACCOUNTANT"),
  getInvoice
);

export default accountantRouter;
