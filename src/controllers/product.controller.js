import { Product } from "../models/product.model.js";

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
