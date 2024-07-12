import express from "express";
import {
  getAllProducts,
  getProductbyId,
  createProduct,
  updateProduct,
  deleteProduct,
  updateManyPrices,
} from "../controllers/productController";
import { protect, restricTo } from "../controllers/userController";

const productRouter = express.Router();

productRouter.get("/", protect, restricTo("ADMIN", "MANAGER"),getAllProducts);
productRouter.get("/:id", protect,  restricTo("ADMIN", "MANAGER"),getProductbyId);
productRouter.post("/", protect, restricTo("ADMIN", "MANAGER"), createProduct);
productRouter.put("/prices", protect,  restricTo("ADMIN", "MANAGER"),updateManyPrices);
productRouter.put("/:id", protect, restricTo("ADMIN", "MANAGER"), updateProduct);
productRouter.delete("/:id", protect, restricTo("ADMIN"), deleteProduct);

export default productRouter;
