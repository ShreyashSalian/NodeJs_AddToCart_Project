import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function.js";

const forgotPasswordValidator = () => {
  return checkSchema({
    email: {
      notEmpty: {
        errorMessage: "Please enter the email.",
      },
      isEmail: {
        errorMessage: "Please enter the valid email.W",
      },
    },
  });
};

export default forgotPasswordValidator;
