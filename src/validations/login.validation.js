import { checkSchema } from "express-validator";

const loginValidation = () => {
  return checkSchema({
    userName: {
      notEmpty: {
        errorMessage: "Please enter the UserName or Email.",
      },
    },
    password: {
      notEmpty: {
        errorMessage: "Please enter the password.",
      },
    },
  });
};

export default loginValidation;
