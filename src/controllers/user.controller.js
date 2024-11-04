import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import forgotPasswordMail from "../utils/sendMail.js";

const generateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error",
    };
    return res.status(500).json(responsePayload);
  }
};

export const registerUser = async (req, res) => {
  try {
    const { userName, email, fullName, password, avatar, coverImage } =
      req.body;

    const userExists = await User.findOne({
      $or: [{ email: email }, { userName: userName }],
    });
    if (userExists) {
      const responsePayload = {
        status: 409,
        message: null,
        data: null,
        error: "UserName or email already exists.",
      };
      return res.status(409).json(responsePayload);
    }
    // Check file is not empty
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImagePath;
    if (
      req.files &&
      Array.isArray(req.files.coverImage) &&
      req.files.length > 0
    ) {
      coverImagePath = req.files?.coverImage[0]?.path;
    }
    if (!avatarLocalPath) {
      const responsePayload = {
        status: 409,
        message: null,
        data: null,
        error: "Please enter the avatar.........",
      };
      return res.status(409).json(responsePayload);
    }

    const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
    const coverImageUpload = await uploadOnCloudinary(coverImagePath);
    if (!avatarUpload) {
      const responsePayload = {
        status: 409,
        message: null,
        data: null,
        error: "Please enter the avatar.........",
      };
      return res.status(409).json(responsePayload);
    }
    const user = await User.create({
      fullName: fullName,
      email: email,
      userName: userName.toLowerCase(),
      password: password,
      avatar: avatarUpload?.url,
      coverImage: coverImageUpload?.url || "",
    });
    // 8. Store data in DB.
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    if (!createdUser) {
      const responsePayload = {
        status: 500,
        message: null,
        data: null,
        error: "Sorry, the user is not created.",
      };
      return res.status(500).json(responsePayload);
    } else {
      const responsePayload = {
        status: 200,
        message: "The user has been created successfully.",
        data: createdUser,
        error: null,
      };
      return res.status(200).json(responsePayload);
    }
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal Server error.",
    };
    return res.status(500).json(responsePayload);
  }
};

export const login = async (req, res) => {
  try {
    // 1. Get the input
    const { userName, password } = req.body;
    // 2. Check the given details
    const user = await User.findOne({
      $or: [{ email: userName }, { userName: userName }],
    });
    if (!user) {
      const responsePayload = {
        status: 404,
        message: null,
        data: null,
        error: "User not found with the given username or email.",
      };
      return res.status(404).json(responsePayload);
    }
    // 3. Check for the password
    const passwordCheck = await user.comparePassword(password);
    if (!passwordCheck) {
      const responsePayload = {
        status: 404,
        message: null,
        data: null,
        error: "Please enter valid password",
      };
      return res.status(404).json(responsePayload);
    }
    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
      user._id
    );
    const loginUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    const responsePayload = {
      status: 200,
      message: "User login Successfully",
      data: { accessToken, refreshToken, loginUser },
      error: null,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(responsePayload);
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error",
    };
    return res.status(500).json(responsePayload);
  }
};

export const logout = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          refreshToken: null,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    const responsePayLoad = {
      status: 200,
      message: "User logout successfully",
      data: null,
      error: null,
    };

    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(responsePayLoad);
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error",
    };
    return res.status(500).json(responsePayload);
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "Please enter the refresh token.",
      };
      return res.status(401).json(responsePayload);
    }
    const verifyRefreshToken = await jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN
    );
    if (!verifyRefreshToken) {
      console.log(err);
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "Unauthorized user.",
      };
      return res.status(401).json(responsePayload);
    }

    //generate token-----
    const user = await User.findById(verifyRefreshToken?._id);
    if (!user) {
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "Please enter the valid refresh token",
      };
      return res.status(401).json(responsePayload);
    }
    if (incomingRefreshToken !== user.refreshToken) {
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "Refresh token is expired.",
      };
      return res.status(401).json(responsePayload);
    }

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
      user?._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    const responsePayLoad = {
      status: 200,
      message: "Refresh token generated successfully.",
      data: { accessToken, refreshToken },
      error: null,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options);
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error",
    };
    return res.status(500).json(responsePayload);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
      console.log(err);
      const responsePayload = {
        status: 404,
        message: null,
        data: null,
        error: "User not found.",
      };
      return res.status(404).json(responsePayload);
    }

    const passwordCheck = await user.comparePassword(oldPassword);
    if (!passwordCheck) {
      const responsePayload = {
        status: 401,
        message: null,
        data: null,
        error: "Please enter the valid password.",
      };
      return res.status(401).json(responsePayload);
    }
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });
    const responsePayload = {
      status: 200,
      message: "Password has been updated successfully.",
      data: null,
      error: null,
    };
    return res.status(200).json(responsePayload);
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error",
    };
    return res.status(500).json(responsePayload);
  }
};

export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.user?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      const responsePayload = {
        status: 404,
        message: null,
        data: user,
        error: "No user found",
      };
      return res.status(404).json(responsePayload);
    } else {
      const responsePayload = {
        status: 200,
        message: "User details.",
        data: user,
        error: null,
      };
      return res.status(200).json(responsePayload);
    }
  } catch (err) {
    console.log(error);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Interval server error.",
    };
    return res.status(500).json(responsePayload);
  }
};

export const updateUserAvatar = async (req, res) => {
  try {
    const avatarImageLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarImage);
    if (!avatarImage) {
      const responsePayload = {
        status: 400,
        message: null,
        data: null,
        error: "Please enter the avatar image.",
      };
      return res.status(400).json(responsePayload);
    }

    const avatarImage = await uploadOnCloudinary(avatarImageLocalPath);
    if (!avatarImage) {
      const responsePayload = {
        status: 400,
        message: null,
        data: null,
        error: "Avatar image has not been uploaded",
      };
      return res.status(400).json(responsePayload);
    }
    const user = await User.findById(
      req.user?._id,
      {
        $set: {
          avatar: avatarImage.url,
        },
      },
      {
        new: true,
      }
    ).select("password -refreshToken");
    await deleteFromCloudinary(user?.avatar);
    if (!user) {
      const responsePayload = {
        status: 400,
        message: null,
        data: null,
        error: "Avatar file is not uploaded.",
      };
      return res.status(400).json(responsePayload);
    } else {
      const responsePayload = {
        status: 400,
        message: "Image has been updated successfully.",
        data: null,
        error: null,
      };
      return res.status(400).json(responsePayload);
    }
  } catch (err) {
    console.log(err);
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error.",
    };
    return res.status(500).json(responsePayload);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      const responsePayload = {
        status: 404,
        message: null,
        data: null,
        error: "No user found with the given email",
      };
      return res.status(404).json(responsePayload);
    }
    const token = crypto.randomBytes(32).toString("hex");
    const date = Date.now() + 3600000;
    await User.findByIdAndUpdate(user?._id, {
      $set: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: date,
      },
    });

    await forgotPasswordMail(token, user?.email);
    const responsePayload = {
      status: 200,
      message: "Reset password mail has been send successfully.",
      data: null,
      error: null,
    };
    return res.status(404).json(responsePayload);
  } catch (err) {
    const responsePayload = {
      status: 200,
      message: "Reset password mail has been send successfully.",
      data: null,
      error: null,
    };
    return res.status(404).json(responsePayload);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      const responsePayload = {
        status: 400,
        message: null,
        data: null,
        error: "The token has been expired or please enter the valid token",
      };
      return res.status(400).json(responsePayload);
    }
    user.password = password;
    user.resetPasswordToken = "";
    user.resetPasswordTokenExpiry = "";
    await user.save({ validateBeforeSave: false });
    const responsePayload = {
      status: 200,
      message: "The user has reset the password successfully.",
      data: null,
      error: null,
    };
    return res.status(200).json(responsePayload);
  } catch (err) {
    const responsePayload = {
      status: 500,
      message: null,
      data: null,
      error: "Internal server error.",
    };
    return res.status(500).json(responsePayload);
  }
};
export const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  if (!userName?.trim()) {
    const responsePayload = {
      status: 404,
      message: null,
      data: null,
      error: "No user found",
    };
    return res.status(404).json(responsePayload);
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channels",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscribes",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubscribeToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, "$subscribers.subscribes"],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        userName: 1,
        subscriberCount: 1,
        channelSubscribeToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    const responsePayload = {
      status: 400,
      message: null,
      data: user,
      error: "Channel does not exist",
    };
    return res.status(200).json(responsePayload);
  }
  const responsePayload = {
    status: 200,
    message: "Channel details",
    data: channel[0],
    error: null,
  };
  return res.status(200).json(responsePayload);
});

//Use to the watch history details
export const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "WatchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              foreignField: "_id",
              localField: "owner",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    email: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
  const responsePayload = {
    status: 200,
    message: "Watch history",
    data: user[0].watchHistory,
    error: null,
  };
  return res.status(200).json(responsePayload);
});
