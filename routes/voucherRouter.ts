import express from "express";
import { protect, restricTo } from "../controllers/userController";
import {
  createVoucher,
  deleteVoucher,
  getAllVouchers,
  getVouchersofDay,
} from "../controllers/voucherController";

const voucherRouter = express.Router();

voucherRouter.get(
  "/",
  protect,
  restricTo("ADMIN", "GRADE_CHECKER"),
  getVouchersofDay
);
voucherRouter.get("/all", protect, restricTo("ADMIN"), getAllVouchers);
voucherRouter.post(
  "/",
  protect,
  restricTo("ADMIN", "GRADE_CHECKER"),
  createVoucher
);
voucherRouter.delete("/:id", protect, restricTo("ADMIN"), deleteVoucher);

export default voucherRouter;
