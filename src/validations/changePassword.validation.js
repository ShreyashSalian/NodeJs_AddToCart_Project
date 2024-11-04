import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function.js";

const changePasswordValidator = () => {
  return checkSchema({
    oldPassword: {
      notEmpty: {
        errorMessage: "Please enter the Old password.",
      },
      matches: {
        options: [/[^-\s][a-zA-Z0-9-_.,\s-]+$/],
        errorMessage: "Please enter the valid old password.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    newPassword: {
      notEmpty: {
        errorMessage: "Please enter the new password.",
      },
      matches: {
        options: [/[^-\s][a-zA-Z0-9-_.,\s-]+$/],
        errorMessage: "Please enter the valid new password.",
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
          if (value !== req.body.newPassword) {
            throw new Error("New password and confirm password doesnt match.");
          }
          return true;
        },
      },
    },
  });
};

export default changePasswordValidator;
