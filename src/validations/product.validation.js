import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function.js";

const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/; // Regex to validate URLs
const validImageExtensions = /\.(jpeg|jpg|png)$/i; // Regex for allowed file extensions

const productValidator = () => {
  return checkSchema({
    product_name: {
      notEmpty: {
        errorMessage: "Please enter the product name.",
      },
    },
    product_description: {
      notEmpty: {
        errorMessage: "Please enter the product description.",
      },
    },
    product_quantity: {
      custom: {
        options: (value, { req }) => {
          if (
            !value &&
            (!req.body.product_size || req.body.product_size.length === 0)
          ) {
            throw new Error("Please provide the product quantity.");
          }
          return true;
        },
      },
    },
    product_images: {
      custom: {
        options: (value, { req }) => {
          // Validate that product_images is an array and contains at least one valid image URL
          if (!Array.isArray(req.files) || req.files.length === 0) {
            throw new Error("Please upload at least one product image...");
          }
          const allowedMimeTypes = ["image/jpeg", "image/png"];
          for (let i = 0; i < req.files.length; i++) {
            if (!allowedMimeTypes.includes(req.files[i].mimetype)) {
              throw new Error("Only .jpeg and .png formats are allowed.");
            }
            if (req.files[i].size > 2 * 1024 * 1024) {
              throw new Error("Image size should not exceed 2MB.");
            }
          }
          return true;
        },
      },
    },
    default_price: {
      custom: {
        options: (value, { req }) => {
          if (
            !value &&
            (!req.body.product_size || req.body.product_size.length === 0)
          ) {
            throw new Error(
              "Please provide either a default price or product sizes."
            );
          }
          return true;
        },
      },
      isNumeric: {
        errorMessage: "Default price must be a valid number.",
      },
      optional: {
        options: ({ req }) => {
          return req.body.product_size && req.body.product_size.length > 0
            ? false
            : true;
        },
      },
    },
    product_size: {
      custom: {
        options: (value, { req }) => {
          console.log(value);
          // Check if product_size exists before parsing
          const productSize = req.body.product_size
            ? JSON.parse(req.body.product_size)
            : [];

          if (productSize.length === 0 && !req.body.default_price) {
            throw new Error(
              "Please provide either a default price or product sizes."
            );
          }

          if (!Array.isArray(productSize)) {
            throw new Error("Product size must be an array.");
          }

          for (let size of productSize) {
            if (!size.size || !size.price || !size.quantity) {
              throw new Error(
                "Each product size must have a size, price, and quantity."
              );
            }
          }

          return true;
        },
      },
    },
  });
};

export default productValidator;
