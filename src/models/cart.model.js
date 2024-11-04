import mongoose from "mongoose";
const addToCartModel = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  size: {
    type: String,
  },
  name: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  actual_price: {
    type: Number,
  },
  price: {
    type: Number,
  },
});
const cartModel = new mongoose.Schema(
  {
    items: [addToCartModel],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bill: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Cart = mongoose.model("Cart", cartModel);
