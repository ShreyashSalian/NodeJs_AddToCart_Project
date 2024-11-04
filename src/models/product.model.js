import mongoose from "mongoose";
const sizeModel = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 0,
  },
});

const productModel = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
    },
    product_description: {
      type: String,
      required: true,
    },
    product_quantity: {
      type: Number,
      required: function () {
        return this.product_size.length === 0; // Only required if no size is specified.
      },
    },
    product_size: [sizeModel],
    product_images: [
      {
        type: String,
        required: true,
      },
    ],
    default_price: {
      type: Number, // Default or base price if no size is selected.
      required: function () {
        return this.product_size.length === 0; // Only required if no size is specified.
      },
    },
    product_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productModel);
