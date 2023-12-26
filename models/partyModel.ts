import mongoose from "mongoose";
import TimeOffice from "./timeOfficeModal";

const partySchema = new mongoose.Schema({
  partyName: {
    type: String,
    required: [true, "Please enter your partyName"],
    maxLength: [30, "Your partyName cannot exceed 30 characters"],
  },
  gstNo: {
    type: String,
    required: [true, "Please enter your gstNo"],
    unique: true,
  },
  bankDetails: {
    type: {
      bankName: {
        type: String,
        required: [true, "Please enter your bankName"],
        maxLength: [30, "Your bankName cannot exceed 30 characters"],
      },
      accountNo: {
        type: String,
        required: [true, "Please enter your accountNo"],
        maxLength: [30, "Your accountNo cannot exceed 30 characters"],
      },
      ifscCode: {
        type: String,
        required: [true, "Please enter your ifscCode"],
        maxLength: [30, "Your ifscCode cannot exceed 30 characters"],
      },
    },
    // required: [true, "Please enter your bankDetails"],
  },
  address: {
    type: {
      addressLine1: {
        type: String,
        required: [true, "Please enter your addressLine1"],
        maxLength: [30, "Your addressLine1 cannot exceed 30 characters"],
      },
      addressLine2: {
        type: String,
        // required: [true, "Please enter your addressLine2"],
        maxLength: [30, "Your addressLine2 cannot exceed 30 characters"],
      },
      city: {
        type: String,
        required: [true, "Please enter your city"],
        maxLength: [30, "Your city cannot exceed 30 characters"],
      },
      state: {
        type: String,
        required: [true, "Please enter your state"],
        maxLength: [30, "Your state cannot exceed 30 characters"],
      },
      pincode: {
        type: String,
        required: [true, "Please enter your pincode"],
        maxLength: [30, "Your pincode cannot exceed 30 characters"],
      },
    },
    // required: [true, "Please enter your address"],
  },
  mobileNo: {
    type: String,
    maxLength: [10, "Your mobile number cannot exceed 10 characters"],
    match: [/^[0-9]{10}$/, "Please enter a valid mobile number"],
    unique: false,
  },
});

const Party = mongoose.model("Party", partySchema);

export default Party;
