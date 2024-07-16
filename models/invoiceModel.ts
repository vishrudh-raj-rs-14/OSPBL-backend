import mongoose from 'mongoose';
import Counter from './Counter';

const invoiceSchema = new mongoose.Schema({
  invoiceNo: {
    type:Number,
    required: [true, "Please provide invoice Number"]
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  totalPurchase: {
    type: Number,
    required: [true, 'Please enter your totalPurchase'],
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: [true, 'Please select a party'],
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please enter your vehicleNumber'],
    maxLength: [30, 'Your vehicleNumber cannot exceed 30 characters'],
  },
  totalAmountAfterTax:{
      type: Number,
      required: [true, 'Please enter your totalAmountAfterTax'],
    },
  balanceAmount: {
    type: Number,
  },
  Items: [
    {
      item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Please select a product'],
      },
      netPrice: {
        type: Number,
        required: [true, 'Please enter the price amount'],
      },
      remarks: {
        type: String,
        default: '',
      },
      unitPrice: {
        type: Number,
        required: [true, 'Please enter the unit amount'],
      },
      weight: {
        type: Number,
        required: [true, 'Please enter the weight'],
      },
      loss: {
        type: Number,
        default: 0,
      },
    },
  ],
});

invoiceSchema.pre('save', function (next) {
  this.vehicleNumber = this.vehicleNumber?.toUpperCase();
  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
