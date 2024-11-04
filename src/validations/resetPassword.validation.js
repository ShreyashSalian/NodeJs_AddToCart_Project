import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function.js";

const resetPasswordValidator = () => {
  return checkSchema({
    token: {
      notEmpty: {
        errorMessage: "Please enter the token",
      },
    },
    password: {
      notEmpty: {
        errorMessage: "Please enter the password.",
      },
      matches: {
        options: [/[^-\s][a-zA-Z0-9-_.,\s-]+$/],
        errorMessage: "Please enter the valid password.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    confirmPassword: {
      notEmpty: {
        errorMessage: "Please enter the confirm Password.",
      },
      customSanitizer: {
        options: trimInput,
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Password and confirm password doesnt match.");
          }
          return true;
        },
      },
    },
  });
};

export default resetPasswordValidator;
