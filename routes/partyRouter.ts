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

partyRouter.get("/",protect, restricTo("ADMIN", "MANAGER") ,getAllParties);
partyRouter.get("/:id", protect, restricTo("ADMIN", "MANAGER"), getPartybyId);
partyRouter.post("/", protect, restricTo("ADMIN", "MANAGER"), createParty);
partyRouter.put("/:id", protect, restricTo("ADMIN"), updateParty);
partyRouter.delete("/:id", protect, restricTo("ADMIN"), deleteParty);

export default partyRouter;
