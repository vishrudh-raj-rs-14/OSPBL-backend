"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const gradeCheckController_1 = require("../controllers/gradeCheckController");
const router = express_1.default.Router();
router.get("/", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "GRADE_CHECKER"), gradeCheckController_1.getGradeCheckData);
router.post("/", userController_1.protect, (0, userController_1.restricTo)("ADMIN", "GRADE_CHECKER"), gradeCheckController_1.uploadPDF, gradeCheckController_1.processPDF, gradeCheckController_1.addGradeCheckData);
router.delete('/files', userController_1.protect, (0, userController_1.restricTo)("ADMIN"), gradeCheckController_1.deleteAllBlob);
// router.post("/report", protect,  restricTo("ADMIN", "GRADE_CHECKER"), uploadPDF , uploadfile);
exports.default = router;
