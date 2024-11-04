import express from "express";
import userRouter from "./user.route.js";
import authRouter from "./auth.route.js";
import categoryRouter from "./category.route.js";
import productRouter from "./product.route.js";
import cartRouter from "./cart.routes.js";

const indexRouter = express.Router();
indexRouter.use("/api/v1/users", userRouter);
indexRouter.use("/api/v1/auth", authRouter);
indexRouter.use("/api/v1/category", categoryRouter);
indexRouter.use("/api/v1/products", productRouter);
indexRouter.use("/api/v1/carts", cartRouter);
indexRouter.get("/api/v1", (req, res) => {
  res.status(200).json({ message: "API is running properly" });
});

export default indexRouter;
