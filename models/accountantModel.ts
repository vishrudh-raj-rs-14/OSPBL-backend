import mongoose from "mongoose";

const accountantSchema = new mongoose.Schema({
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    required: [true, "Please select a invoice"],
  },
  checkID: {
    type: String,
    required: [true, "Please enter the checkID"],
  },
  checkAmount: {
    type: Number,
    required: [true, "Please enter the checkAmount"],
  },
  checkDate: {
    type: Date,
    required: [true, "Please enter the checkDate"],
  },
});

const Accountant = mongoose.model("Accountant", accountantSchema);
export default Accountant;
