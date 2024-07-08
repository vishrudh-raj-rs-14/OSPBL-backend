import mongoose from "mongoose";

const timeOfficeSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now(),
  },
  vehicleNumber: {
    type: String,
    required: [true, "Please enter your vehicleNumber"],
    maxLength: [30, "Your vehicleNumber cannot exceed 30 characters"],
  },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Party",
    required: [true, "Please select a party"],
  },
  category: {
    type: String,
    enum: ["waste-paper", "fuel", "chemical", "other"],
    required: [true, "Please enter your category"],
    maxLength: [30, "Your category cannot exceed 30 characters"],
  },
  description: {
    type: String,
    required: [true, "Please enter your description"],
    maxLength: [200, "Your description cannot exceed 200 characters"],
  },
  vehicleStillIn: {
    type: Boolean,
    default: true,
  },
});

timeOfficeSchema.pre("save", async function (next) {
  this.vehicleNumber = this?.vehicleNumber
    ?.toLowerCase()
    ?.trim()
    ?.replace(/[^\w\s-]/g, "")
    ?.replace(/[\s_-]+/g, "")
    ?.replace(/^-+|-+$/g, "");
  next();
});

timeOfficeSchema.pre("save", function (next) {
  this.vehicleNumber = this?.vehicleNumber?.toUpperCase();
  next();
});

const TimeOffice = mongoose.model("TimeOffice", timeOfficeSchema);

export default TimeOffice;
