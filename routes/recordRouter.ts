import express from "express";
import { protect, restricTo } from "../controllers/userController";
import {
  createRecord,
  deleteRecord,
  getAllRecords,
  getRecordsofDay,
} from "../controllers/recordController";

const recordRouter = express.Router();

recordRouter.get(
  "/",
  protect,
  restricTo("ADMIN", "GRADE_CHECKER"),
  getRecordsofDay
);
recordRouter.get("/all", protect, restricTo("ADMIN"), getAllRecords);
recordRouter.post(
  "/",
  protect,
  restricTo("ADMIN", "GRADE_CHECKER"),
  createRecord
);
recordRouter.delete("/:id", protect, restricTo("ADMIN"), deleteRecord);

export default recordRouter;
