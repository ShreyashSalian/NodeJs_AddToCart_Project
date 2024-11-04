import express from "express";
import {
  addCategory,
  listAllCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";
import categoryValidation from "../validations/category.validation.js";
import validateApi from "../middlewares/validator.js";

const categoryRouter = express.Router();
categoryRouter.post(
  "/",
  categoryValidation(),
  validateApi,
  verifyUser,
  addCategory
);
categoryRouter.get("/", verifyUser, listAllCategory);
categoryRouter.delete("/:id", verifyUser, deleteCategory);
categoryRouter.put("/:id", verifyUser, updateCategory);

export default categoryRouter;
