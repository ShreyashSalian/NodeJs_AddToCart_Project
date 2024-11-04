import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyUser = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: null,
        data: null,
        error: "Unauthorized request. No token provided.",
      });
    }
    const decodeToken = await jwt.verify(token, process.env.ACCESS_TOKEN);
    const user = await User.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: null,
        data: null,
        error: "Unauthorized request. Invalid token.",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: 401,
        message: null,
        data: null,
        error: "Unauthorized request.",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: 401,
        message: null,
        data: null,
        error: "Unauthorized request.",
      });
    }

    // Handle other unexpected errors
    console.error("error:", err);
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
      data: null,
      error: "An error occurred during token verification.",
    });
  }
};
