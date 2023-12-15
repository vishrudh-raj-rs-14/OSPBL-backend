import express from "express";

import { protect, restricTo } from "../controllers/userController";
import {
  createWeights,
  deleteAllWeights,
  deleteWeights,
  getAllWeights,
} from "../controllers/weightsController";

const weightsRouter = express.Router();

weightsRouter.get("/", getAllWeights);
weightsRouter.post("/", createWeights);
weightsRouter.delete("/:id", protect, restricTo("ADMIN"), deleteWeights);
weightsRouter.delete("/all", protect, restricTo("ADMIN"), deleteAllWeights);

export default weightsRouter;
