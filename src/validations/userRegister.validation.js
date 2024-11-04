import { checkSchema } from "express-validator";
import { trimInput, phoneNumberValidator } from "../utils/function.js";
import { User } from "../models/user.model.js";

const userRegisterationValidator = () => {
  return checkSchema({
    fullName: {
      notEmpty: {
        errorMessage: "Please enter the fullName",
      },
      matches: {
        options: [/[^-\s][a-zA-Z0-9-_.,\s-]+$/],
        errorMessage: "Please enter the valid fullName",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    email: {
      notEmpty: {
        errorMessage: "Please enter the email.",
      },
      isEmail: {
        errorMessage: "Please enter the valid email.",
      },
      custom: {
        options: (value) => {
          return User.findOne({ where: { email: value } }).then((user) => {
            if (user) {
              return Promise.reject("The email already exists");
            }
          });
        },
      },
    },
    password: {
      notEmpty: {
        errorMessage: "Please enter the password.",
      },
      matches: {
        options: [/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/],
        errorMessage: "Please enter the proper password.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    confirmPassword: {
      notEmpty: {
        errorMessage: "Please enter the confirm password",
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
    avatar: {
      custom: {
        options: (value, { req }) => {
          if (!req.files.avatar) {
            console.log(req.files);
            throw new Error("Please upload an image.");
          }
          const allowedMimeTypes = ["image/jpeg", "image/png"];
          if (!allowedMimeTypes.includes(req.files.avatar[0].mimetype)) {
            throw new Error("Only .jpeg and .png formats are allowed.");
          }
          if (req.files.avatar[0].size > 2 * 1024 * 1024) {
            // Limit file size to 2MB
            throw new Error("Image size should not exceed 2MB.");
          }
          return true;
        },
      },
    },
  });
};

export default userRegisterationValidator;
