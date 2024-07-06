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
  restricTo("ADMIN", "GRADE_CHECKER", "SECURITY"),
  getVouchersofDay
);
voucherRouter.get('/get-pdf/:filename', protect, restricTo("ADMIN") , getFile);
voucherRouter.get("/all", protect, restricTo("ADMIN"), getAllVouchers);
voucherRouter.get(
  "/:id",
  protect,
  restricTo("ADMIN"),
  getVoucher
);
voucherRouter.post(
  "/",
  protect,
  restricTo("ADMIN", "GRADE_CHECKER"),
  createVoucher
);

voucherRouter.put("/:id", protect, restricTo("ADMIN", "SECURITY"), vehicleLeft);

voucherRouter.delete("/:id", protect, restricTo("ADMIN"), deleteVoucher);

export default voucherRouter;
