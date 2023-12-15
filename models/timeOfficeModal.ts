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
});

timeOfficeSchema.pre("save", async function (next) {
  this.vehicleNumber = this.vehicleNumber
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "")
    .replace(/^-+|-+$/g, "");
  next();
});

const TimeOffice = mongoose.model("TimeOffice", timeOfficeSchema);

export default TimeOffice;
