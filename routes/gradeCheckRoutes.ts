import express from "express";
import { protect, restricTo } from "../controllers/userController";
import { addGradeCheckData, getGradeCheckData, processPDF, uploadPDF, deleteAllBlob } from "../controllers/gradeCheckController";

const router = express.Router();

router.get("/", protect,  restricTo("ADMIN", "GRADE-CHECKER"), getGradeCheckData);
router.post("/", protect,  restricTo("ADMIN", "GRADE-CHECKER"), uploadPDF, processPDF, addGradeCheckData);
router.delete('/files', protect, restricTo("ADMIN"), deleteAllBlob );
// router.post("/report", protect,  restricTo("ADMIN", "GRADE_CHECKER"), uploadPDF , uploadfile);

export default router;