import express from "express";
import productValidator from "../validations/product.validation.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/product.middleware.js";
import validateApi from "../middlewares/validator.js";
import { addProduct } from "../controllers/product.controller.js";

const productRouter = express.Router();
productRouter.post(
  "/",
  verifyUser,
  upload.array("product_images"),
  productValidator(),
  validateApi,
  addProduct
);

export default productRouter;
