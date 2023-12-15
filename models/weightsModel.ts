import mongoose from "mongoose";

const weightsSchema = new mongoose.Schema({
  measuredAt: {
    type: Date,
    default: Date.now(),
  },
  weight: {
    type: Number,
    required: [true, "Please enter your weight"],
  },
  vehicleNumber: {
    type: String,
    required: [true, "Please enter your vehicleNumber"],
    maxLength: [30, "Your vehicleNumber cannot exceed 30 characters"],
  },
  image1: {
    type: String,
    // required: [true, "Please enter your image1"],
  },
  image2: {
    type: String,
    // required: [true, "Please enter your image2"],
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Party",
  },
});

weightsSchema.pre("save", async function (next) {
  this.vehicleNumber = this.vehicleNumber
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "")
    .replace(/^-+|-+$/g, "");
  next();
});

const Weights = mongoose.model("Weights", weightsSchema);

export default Weights;
