import express from "express";
import { protect, restricTo } from "../controllers/userController";
import {
  createVoucher,
  deleteVoucher,
  getAllVouchers,
  getFile,
  getVoucher,
  getVouchersofDay,
  vehicleLeft,
} from "../controllers/voucherController";

const voucherRouter = express.Router();

voucherRouter.get(
  "/",
  protect,
  restricTo("ADMIN", "GRADE-CHECKER", "SECURITY"),
  getVouchersofDay
);
voucherRouter.get('/get-pdf/:filename', protect, restricTo("ADMIN", "GRADE-CHECKER") , getFile);
voucherRouter.get("/all", protect, restricTo("ADMIN", "GRADE-CHECKER"), getAllVouchers);
voucherRouter.get(
  "/:id",
  protect,
  restricTo("ADMIN"),
  getVoucher
);
voucherRouter.post(
  "/",
  protect,
  restricTo("ADMIN", "GRADE-CHECKER"),
  createVoucher
);

voucherRouter.put("/:id", protect, restricTo("ADMIN", "SECURITY"), vehicleLeft);

voucherRouter.delete("/:id", protect, restricTo("ADMIN"), deleteVoucher);

export default voucherRouter;
