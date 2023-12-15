import express from "express";
import {
  getAllParties,
  getPartybyId,
  createParty,
  updateParty,
  deleteParty,
} from "../controllers/partyController";
import { protect, restricTo } from "../controllers/userController";
const partyRouter = express.Router();

partyRouter.get("/", getAllParties);
partyRouter.get("/:id", getPartybyId);
partyRouter.post("/", protect, restricTo("ADMIN"), createParty);
partyRouter.put("/:id", protect, restricTo("ADMIN"), updateParty);
partyRouter.delete("/:id", protect, restricTo("ADMIN"), deleteParty);

export default partyRouter;
