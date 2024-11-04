import express from "express";
import {
  addItemToCart,
  deleteItemFromCart,
  updateItemQuantity,
  getItemFromCart,
} from "../controllers/cart.controller.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const cartRouter = express.Router();
cartRouter.post("/add-item", verifyUser, addItemToCart);
cartRouter.delete("/remove-item", verifyUser, deleteItemFromCart);
cartRouter.put("/update-item", verifyUser, updateItemQuantity);
cartRouter.get("/", verifyUser, getItemFromCart);

export default cartRouter;
