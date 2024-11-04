import express from "express";
import { login, logout } from "../controllers/user.controller.js";
import loginValidation from "../validations/login.validation.js";
import validateApi from "../middlewares/validator.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/login", loginValidation(), validateApi, login);
authRouter.get("/logout", verifyUser, logout);
export default authRouter;
