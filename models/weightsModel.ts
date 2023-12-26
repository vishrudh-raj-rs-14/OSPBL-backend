import mongoose from "mongoose";

const weightsSchema = new mongoose.Schema({
  measuredAt: {
    type: Date,
    default: Date.now(),
  },
  weight1: {
    type: Number,
    required: [true, "Please enter weight1"],
  },
  weight2: {
    type: Number,
    required: [true, "Please enter weight1"],
  },
  netWeight: {
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
    required: true,
  },
  image2: {
    type: String,
    required: true,
  },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Party",
    // required: [true, "Please select a party"],
  },
});

weightsSchema.pre("save", function (next) {
  this.vehicleNumber = this.vehicleNumber.toUpperCase();
  next();
});

// weightsSchema.pre("save", async function (next) {
//   this.vehicleNumber = this.vehicleNumber
//     .toLowerCase()
//     .trim()
//     .replace(/[^\w\s-]/g, "")
//     .replace(/[\s_-]+/g, "")
//     .replace(/^-+|-+$/g, "");
//   next();
// });

const Weights = mongoose.model("Weights", weightsSchema);

export default Weights;
