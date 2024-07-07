"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const timeOfficeController_1 = require("../controllers/timeOfficeController");
const userController_1 = require("../controllers/userController");
const timeOfficeRouter = express_1.default.Router();
timeOfficeRouter.get("/", 
// protect,
// restricTo("ADMIN", "SECURITY"),
timeOfficeController_1.gettimeOfficeRecordsOfDay);
timeOfficeRouter.get("/all", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), timeOfficeController_1.getAlltimeOffices);
timeOfficeRouter.get("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), timeOfficeController_1.gettimeOfficebyId);
timeOfficeRouter.post("/", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "SECURITY"), timeOfficeController_1.createtimeOffice);
timeOfficeRouter.put("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), timeOfficeController_1.updatetimeOffice);
timeOfficeRouter.delete("/:id", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), timeOfficeController_1.deletetimeOffice);
exports.default = timeOfficeRouter;
