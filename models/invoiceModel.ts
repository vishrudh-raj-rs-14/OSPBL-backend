import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
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
  balanceAmount: {
    type: Number,
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
      unitPrice: {
        type: Number,
        required: [true, "Please enter the unit amount"],
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

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
