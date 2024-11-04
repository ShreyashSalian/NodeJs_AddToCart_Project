import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function.js";
import { Category } from "../models/category.model.js";

const categoryValidation = () => {
  return checkSchema({
    title: {
      notEmpty: {
        errorMessage: "Please enter the category title.",
      },
      customSanitizer: {
        options: trimInput,
      },
      custom: {
        options: (value) => {
          return Category.findOne({ where: { title: value } }).then(
            (category) => {
              if (category) {
                return Promise.reject("The product title already exists");
              }
            }
          );
        },
      },
    },
    description: {
      notEmpty: {
        errorMessage: "Please enter the category description.",
      },
    },
  });
};

export default categoryValidation;
