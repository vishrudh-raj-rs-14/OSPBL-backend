import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now(),
  },

  party: {
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
        type: String,
        // ref: "Product",
        required: [true, "Please select a product"],
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

const Voucher = mongoose.model("Voucher", voucherSchema);

export default Voucher;
