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

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductbyId);
productRouter.post("/", protect, restricTo("ADMIN"), createProduct);
productRouter.put("/prices", updateManyPrices);
productRouter.put("/:id", protect, restricTo("ADMIN"), updateProduct);
productRouter.delete("/:id", protect, restricTo("ADMIN"), deleteProduct);

export default productRouter;
