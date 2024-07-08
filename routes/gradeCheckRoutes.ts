import express from "express";
import { protect, restricTo } from "../controllers/userController";
import { addGradeCheckData, getGradeCheckData, processPDF, uploadPDF, getAllBlob } from "../controllers/gradeCheckController";

const router = express.Router();

router.get("/", protect,  restricTo("ADMIN", "GRADE_CHECKER"), getGradeCheckData);
router.post("/", protect,  restricTo("ADMIN", "GRADE_CHECKER"), uploadPDF, processPDF, addGradeCheckData);
router.get('/files', getAllBlob )
// router.post("/report", protect,  restricTo("ADMIN", "GRADE_CHECKER"), uploadPDF , uploadfile);

export default router;