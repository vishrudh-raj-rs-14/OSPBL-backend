import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Party",
  },

  debit: {
    type: Number,
    required: [true, "Please enter the debit"],
  },
  date: {
    type: Date,
    required: [true, "Please enter the checkDate"],
  },
  credit: {
    type: Number,
    required: [true, "Please enter the credit"],
  },
});

const Report = mongoose.model("Report", reportSchema);

export default Report;
