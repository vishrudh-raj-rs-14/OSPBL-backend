"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const connectDatabase_1 = __importDefault(require("./utils/connectDatabase"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const errorHandler_1 = require("./middleware/errorHandler");
const userController_1 = require("./controllers/userController");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const partyRouter_1 = __importDefault(require("./routes/partyRouter"));
const productRouter_1 = __importDefault(require("./routes/productRouter"));
const timeOfficeRoutes_1 = __importDefault(require("./routes/timeOfficeRoutes"));
const weightsRouter_1 = __importDefault(require("./routes/weightsRouter"));
const voucherRouter_1 = __importDefault(require("./routes/voucherRouter"));
const accountantRouter_1 = __importDefault(require("./routes/accountantRouter"));
const reportRouter_1 = __importDefault(require("./routes/reportRouter"));
const gradeCheckRoutes_1 = __importDefault(require("./routes/gradeCheckRoutes"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
(0, connectDatabase_1.default)("OSPBL");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
}));
const port = 8080 || process.env.PORT || 8080;
app.use("/public", express_1.default.static(path_1.default.join(__dirname, "public")));
app.use("/api/users", userRouter_1.default);
app.use("/api/parties", partyRouter_1.default);
app.use("/api/products", productRouter_1.default);
app.use("/api/timeOffice", timeOfficeRoutes_1.default);
app.use("/api/weights", weightsRouter_1.default);
app.use("/api/vouchers", voucherRouter_1.default);
app.use("/api/payments", accountantRouter_1.default);
app.use("/api/report", reportRouter_1.default);
app.use("/api/gradeCheck", gradeCheckRoutes_1.default);
app.use("/test", userController_1.protect, (0, userController_1.restricTo)("ADMIN"), (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Protected route",
    });
});
app.use(errorHandler_1.notFoundErr);
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
