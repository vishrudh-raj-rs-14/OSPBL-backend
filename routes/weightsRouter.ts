import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export { upload };

import { protect, restricTo } from "../controllers/userController";
import {
  createWeights,
  deleteAllWeights,
  deleteWeights,
  getAllWeights,
  uploadPhotos,
  processImages,
} from "../controllers/weightsController";
import express, { RequestHandler } from "express";

const weightsRouter = express.Router();

weightsRouter.get("/", getAllWeights);
weightsRouter.post("/", uploadPhotos, processImages, createWeights);
weightsRouter.delete("/:id", protect, restricTo("ADMIN"), deleteWeights);
weightsRouter.delete("/all", protect, restricTo("ADMIN"), deleteAllWeights);

export default weightsRouter;
