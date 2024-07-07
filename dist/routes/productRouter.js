"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const userController_1 = require("../controllers/userController");
const productRouter = express_1.default.Router();
productRouter.get("/", productController_1.getAllProducts);
productRouter.get("/:id", productController_1.getProductbyId);
productRouter.post("/", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), productController_1.createProduct);
productRouter.put("/prices", productController_1.updateManyPrices);
productRouter.put("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), productController_1.updateProduct);
productRouter.delete("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), productController_1.deleteProduct);
exports.default = productRouter;
