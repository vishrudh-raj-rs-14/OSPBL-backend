import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./utils/connectDatabase";
import userRouter from "./routes/userRouter";
import { errorHandler, notFoundErr } from "./middleware/errorHandler";
import { protect, restricTo } from "./controllers/userController";
import cookieParser from "cookie-parser";
import partyRouter from "./routes/partyRouter";
import productRouter from "./routes/productRouter";
import timeOfficeRouter from "./routes/timeOfficeRoutes";
import weightsRouter from "./routes/weightsRouter";
import recordRouter from "./routes/recordRouter";
dotenv.config();

connectDatabase("OSPBL");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const port = process.env.PORT || 3000;

app.use("/api/users", userRouter);
app.use("/api/parties", partyRouter);
app.use("/api/products", productRouter);
app.use("/api/timeOffice", timeOfficeRouter);
app.use("/api/weights", weightsRouter);
app.use("/api/reports", recordRouter);

app.use("/test", protect, restricTo("ADMIN"), (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Protected route",
  });
});

app.use(notFoundErr);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
