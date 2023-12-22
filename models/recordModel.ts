import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now(),
  },
  totalPurchase: {
    type: Number,
    required: [true, "Please enter your totalPurchase"],
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Party",
    required: [true, "Please select a party"],
  },
  vehicleNumber: {
    type: String,
    required: [true, "Please enter your vehicleNumber"],
    maxLength: [30, "Your vehicleNumber cannot exceed 30 characters"],
  },
  Items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Please select a product"],
      },
      netPrice: {
        type: Number,
        required: [true, "Please enter the price amount"],
      },
      weight: {
        type: Number,
        required: [true, "Please enter the weight"],
      },
      images: [
        {
          type: String,
        },
      ],
      loss: {
        type: String,
        default: "0%",
      },
    },
  ],
});

const Record = mongoose.model("Record", recordSchema);

export default Record;
