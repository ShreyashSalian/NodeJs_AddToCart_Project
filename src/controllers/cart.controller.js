import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";

export const getItemFromCart = async (req, res) => {
  try {
    const user = req.user?._id;
    const cart = await Cart.find({ userId: user });
    if (cart && cart.items.length > 0) {
      const responsePayload = {
        status: 200,
        message: "The cart details.",
        data: cart,
        error: null,
      };
      return res.status(200).json(responsePayload);
    } else {
      const responsePayload = {
        status: 200,
        message: "The cart is empty",
        data: null,
        error: nul,
      };
      return res.status(500).json(responsePayload);
    }
  } catch (err) {
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error.",
    };
    return res.status(500).json(responsePayload);
  }
};

export const addItemToCart = async (req, res) => {
  try {
    const user = req.user?._id;
    let name = "";
    let price = 0;

    const { productId, quantity, size } = req.body;

    // Find the product
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(200).json({
        status: 200,
        message: "No product found",
        data: null,
        error: null,
      });
    }

    name = product.product_name;
    // Get price based on size or default price
    if (size) {
      const sizeItem = product.product_size.find((item) => item.size === size);
      if (!sizeItem) {
        return res.status(400).json({
          status: 400,
          message: "Invalid size selected",
          data: null,
          error: null,
        });
      }
      price = sizeItem.price;
    } else {
      price = product.default_price;
    }
    // Find the cart for the user
    const cart = await Cart.findOne({ userId: user });
    if (cart) {
      //Check if product with same size already exists in the cart
      const cartIndex = cart.items.findIndex((item) => {
        return (
          item.productId.equals(new mongoose.Types.ObjectId(productId)) ||
          item.size === size
        );
      });

      if (cartIndex > -1) {
        // If product exists, update the quantity and price
        let product = cart.items[cartIndex];
        product.quantity += quantity;
        product.price += price * quantity;
        product.actual_price = price;
        cart.bill += quantity * price;
        cart.items[cartIndex] = product;
        await cart.save();
        return res.status(200).json({
          status: 200,
          message: "Item added in the cart",
          data: cart,
          error: null,
        });
      } else {
        // If product does not exist, add a new item to the cart

        cart.items.push({
          productId,
          name,
          size: size || "", // Default to empty string if no size is provided
          quantity,
          actual_price: price,
          price,
        });

        cart.bill += quantity * price;

        await cart.save();
        return res.status(200).json({
          status: 200,
          message: "Item added/updated in the cart",
          data: cart,
          error: null,
        });
      }
      // Update the bill
    } else {
      const newCart = await Cart.create({
        items: [
          {
            productId,
            name,
            size: size || "", // Default to empty string if no size is provided
            quantity,
            price,
            actual_price: price,
          },
        ],
        bill: quantity * price, // Calculate the bill
        userId: user,
      });

      return res.status(200).json({
        status: 200,
        message: "Item added to the cart",
        data: newCart,
        error: null,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: null,
      data: null,
      error: "Internal server error.",
    });
  }
};

export const deleteItemFromCart = async (req, res) => {
  try {
    const user = req.user?._id;
    const { productId } = req.body;
    const product = await Product.findOne({ _id: productId });

    if (!product) {
      return res.status(200).json({
        status: 200,
        message: "No product found",
        data: null,
        error: null,
      });
    }
    const cart = await Cart.findOne({ userId: user });
    if (cart) {
      const cartIndex = cart.items.findIndex((item) => {
        return item.productId.equals(new mongoose.Types.ObjectId(productId));
      });
      console.log(cartIndex);

      if (cartIndex > -1) {
        let productItem = cart.items[cartIndex];
        cart.bill -= productItem.quantity * productItem.price;
        if (cart.bill < 0) {
          cart.bill = 0;
        }
        cart.items.splice(cartIndex, 1);
        // cart.bill = cart.items.reduce((acc, curr) => {
        //   return acc + curr.quantity * curr.price;
        // }, 0);

        await cart.save();
        return res.status(200).json({
          status: 200,
          message: "Item deleted from the cart",
          data: cart,
          error: null,
        });
      } else {
        return res.status(200).json({
          status: 200,
          message: "The cart is empty",
          data: null,
          error: null,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: null,
      data: null,
      error: "Internal server error.",
    });
  }
};

export const updateItemQuantity = async (req, res) => {
  try {
    const user = req.user?._id;
    const { productId, quantity, size } = req.body; // quantity to update

    // Find the product by productId
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
        data: null,
        error: null,
      });
    }

    // Find the user's cart
    const cart = await Cart.findOne({ userId: user });
    if (!cart) {
      return res.status(404).json({
        status: 404,
        message: "Cart is empty",
        data: null,
        error: null,
      });
    }

    // Find the index of the product in the cart's items array
    const cartIndex = cart.items.findIndex((item) => {
      return item.productId.equals(new mongoose.Types.ObjectId(productId));
    });

    if (cartIndex === -1) {
      return res.status(404).json({
        status: 404,
        message: "Product not found in the cart",
        data: null,
        error: null,
      });
    }

    let productItem = cart.items[cartIndex];

    // Calculate the total price for the current quantity and reduce it from the bill
    const previousTotal = productItem.quantity * productItem.actual_price;
    cart.bill -= previousTotal;

    productItem.quantity = quantity;

    // Update the product quantity and price in the cart
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item from the cart
      cart.items.splice(cartIndex, 1);
      //----------------------------------------------------
      // Update quantity and prices
    } else {
      const size = productItem?.size;
      if (size) {
        const sizeItem = product.product_size.find(
          (item) => item.size === size
        );
        productItem.actual_price = sizeItem?.price;
        productItem.price = quantity * sizeItem?.price;
      } else {
        productItem.actual_price = product.default_price;
        productItem.price = quantity * product.default_price;
      }
      // Add the new total price to the bill
      cart.bill += productItem.price;

      // Update the item in the cart
      cart.items[cartIndex] = productItem;
    }

    // Save the updated cart
    await cart.save();

    return res.status(200).json({
      status: 200,
      message: "Cart updated successfully",
      data: cart,
      error: null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      data: null,
      error: err.message,
    });
  }
};
