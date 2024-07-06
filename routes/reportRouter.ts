import express from "express";
import { getReport } from "../controllers/reportController";
import { protect, restricTo } from "../controllers/userController";
const reportRouter = express.Router();

reportRouter.get(
  "/:partyId",
   protect, restricTo("ADMIN"),
  getReport
);

export default reportRouter;
