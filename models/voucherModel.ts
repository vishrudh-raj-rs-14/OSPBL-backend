import mongoose, { Mongoose } from "mongoose";

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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: [true, "Please select a product"],
      },
      weight: {
        type: Number,
        required: [true, "Please enter the weight"],
      },
      remarks:{
        type: String,
        default: ""
      },
      loss: {
        type: Number,
        default: 0,
      },report:{
        type:"String",
        required: [true, "Please enter your report"],
      },
      reportUrl:{
        type:"String",
        required: [true, "Please enter your report"],
      },
      downloadUrl:{
        type: String,
        required: [true, "Please enter your downloadUrl"],
      },
    },
  ],
});

voucherSchema.pre("save", function (next) {
  this.vehicleNumber = this?.vehicleNumber?.toUpperCase();
  next();
});

const Voucher = mongoose.model("Voucher", voucherSchema);

export default Voucher;
