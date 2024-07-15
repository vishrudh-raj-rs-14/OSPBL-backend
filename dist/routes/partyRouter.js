"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const partyController_1 = require("../controllers/partyController");
const userController_1 = require("../controllers/userController");
const partyRouter = express_1.default.Router();
partyRouter.get("/", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "MANAGER", "SECURITY"), partyController_1.getAllParties);
partyRouter.get("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "MANAGER", "SECURITY"), partyController_1.getPartybyId);
partyRouter.post("/", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "MANAGER"), partyController_1.createParty);
partyRouter.put("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), partyController_1.updateParty);
partyRouter.delete("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), partyController_1.deleteParty);
exports.default = partyRouter;
