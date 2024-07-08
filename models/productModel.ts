import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxLength: [30, "Your name cannot exceed 30 characters"],
  },
  price: [
    {
      party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Party",
        required: [true, "Please select a party"],
      },
      amount: {
        type: Number,
        required: [true, "Please enter the price amount"],
      },
    },
  ],
  code: {
    type: String,
    // required: [true, "Please enter your code"],
    maxLength: [30, "Your code cannot exceed 30 characters"],
    unique: [true, "This product already exists"],
  },
  category: {
    type: String,
    enum: ["waste-paper", "fuel", "chemical", "other"],
    // required: [true, "Please enter your category"],
  },
});

productSchema.pre("save", async function (next) {
  console.log("here");
  this.code = this?.name
    ?.toLowerCase()
    ?.trim()
    ?.replace(/[^\w\s-]/g, "")
    ?.replace(/[\s_-]+/g, "-")
    ?.replace(/^-+|-+$/g, "");
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
