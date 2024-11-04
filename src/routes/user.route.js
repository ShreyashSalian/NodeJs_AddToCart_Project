import express from "express";
import {
  registerUser,
  updateUserAvatar,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import userRegistrationValidator from "../validations/userRegister.validation.js";
import validateApi from "../middlewares/validator.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import forgotPasswordValidator from "../validations/forgotPassword.validation.js";
import resetPasswordValidator from "../validations/resetPassword.validation.js";
import changePasswordValidator from "../validations/changePassword.validation.js";

const userRouter = express.Router();
userRouter.post(
  "/",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  userRegistrationValidator(),
  validateApi,
  registerUser
);

userRouter.post(
  "/avatar-image",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  verifyUser,
  updateUserAvatar
);

userRouter.post(
  "/forgot-password",
  forgotPasswordValidator(),
  validateApi,
  forgotPassword
);
userRouter.post(
  "/reset-password",
  resetPasswordValidator(),
  validateApi,
  resetPassword
);
userRouter.post(
  "/change-password",
  verifyUser,
  changePasswordValidator(),
  validateApi,
  changePassword
);
// router.get('/admin', authorizeRole(['admin']), (req, res) => {
//   res.send("Welcome Admin!");
// });

export default userRouter;
