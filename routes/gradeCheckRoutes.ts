import express from "express";
import { protect, restricTo } from "../controllers/userController";
import { addGradeCheckData, getGradeCheckData, processPDF, uploadPDF, uploadfile } from "../controllers/gradeCheckController";

const router = express.Router();

router.get("/", protect,  restricTo("ADMIN", "GRADE_CHECKER"), getGradeCheckData);
router.post("/", protect,  restricTo("ADMIN", "GRADE_CHECKER"), uploadPDF, processPDF, addGradeCheckData);
router.post("/report", protect,  restricTo("ADMIN", "GRADE_CHECKER"), uploadfile);

export default router;