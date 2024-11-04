import { Product } from "../models/product.model.js";
import { Redis } from "ioredis";

export const addProduct = async (req, res) => {
  try {
    const {
      product_name,
      product_description,
      product_quantity,
      product_size,
      default_price,
      product_category,
    } = req.body;

    //initialize an empty array for the image filename
    const images = [];
    req.files.forEach((file) => {
      images.push(file.filename);
    });

    const newProduct = await Product.create({
      product_name: product_name,
      product_description: product_description,
      product_quantity: product_quantity ? product_quantity : undefined,
      product_size: product_size ? JSON.parse(product_size) : [],
      default_price: default_price ? default_price : undefined,
      product_category,
      product_images: images,
    });

    if (newProduct) {
      return res.status(200).json({
        status: 200,
        message: "Product added successfully.",
        data: newProduct,
        error: null,
      });
    } else {
      return res.status(500).json({
        status: 500,
        message: "Sorry, the product cannot be added.",
        data: null,
        error: "Product creation failed.",
      });
    }
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error",
    };
    return res.status(500).json(responsePayload);
  }
};

export const listAllProducts = async (req, res) => {
  try {
    const redisClient = new Redis({
      host: "127.0.0.1", // e.g., '127.0.0.1'
      port: 6379, // e.g., 6379
    });

    // Error handling for Redis connection
    redisClient.on("error", (err) => console.error("Redis Client Error", err));
    const client = new Redis();
    const cacheValue = await redisClient.get("products");
    if (cacheValue) {
      // Parse cached data and return it
      const products = JSON.parse(cacheValue);
      const responsePayload = {
        status: 200,
        message: "The product list",
        data: products,
        error: null,
      };
      return res.status(200).json(responsePayload);
    }

    // If cache miss, fetch products from the database
    const products = await Product.find();

    if (products.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "There are no products.",
        data: null,
        error: "No products found.",
      });
    }

    // Cache the fetched products with a 30-second expiration
    await redisClient.setEx("products", 30, JSON.stringify(products));

    // Send the response with the fetched data
    const responsePayload = {
      status: 200,
      message: "The product list",
      data: products,
      error: null,
    };
    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error.",
    };
    return res.status(500).json(responsePayload);
  }
};
