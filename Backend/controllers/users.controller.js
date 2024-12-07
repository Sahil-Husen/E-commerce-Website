import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import UserModel from "../model/user.model.js";
import sendEmail from "../config/sendEmail.js";
import varifyEmailTemplate from "../utils/varifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";

// User Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!(name && email && password)) {
      return res.status(400).json({
        message: "Provide email,name,password",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.json({
        message: "User Already Exits",
        error: true,
        success: false,
      });
    }

    const salt = await bcryptjs.genSalt(10);
    // const hashedPassword =  bcryptjs.hash(password, salt);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const payload = {
      name: name,
      email: email,
      password: hashedPassword,
    };

    const newUser = new UserModel(payload);
    const save = await newUser.save();
    const VarifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`;

    const varifyEmail = await sendEmail({
      sendTo: email,
      subject: "Varification Email from MyBlinkit",
      // here provide Template
      html: varifyEmailTemplate({
        name,
        url: VarifyEmailUrl,
      }),
    });
    return res.json({
      message: "User register Successfully",
      error: false,
      success: true,
      data: save,
    });
  } catch (error) {
    // return res.status(500).json({
    //   message: error.message || error,
    //   error: true,
    //   success: false,
    // });
    console.log(error);
    console.log("Error in user registering");
  }
};

// Email varification by code
export const varifyEmailController = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await UserModel.findOne({ _id: code });

    if (!user) {
      return res.status(400).json({
        message: "Invalid code",
        error: true,
        success: false,
      });
    }
    const updateUser = await UserModel.updateOne(
      { _id: code },
      {
        varify_email: true,
      }
    );
    return res.json({
      message: "Varification email done!👍",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// login controller
// import generatedAccessToken from "../utils/generatedAccessToken.js";
// import generatedRefreshToken from "../utils/generatedRefreshToken.js";
// import UserModel from "../model/user.model.js";
// import bcryptjs from "bcryptjs"; //Make sure this is imported

// login controller
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!(email && password)) {
      return res
        .status(400)
        .json({ message: "Please provide Email & Password", error: true });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found! Please register", error: true });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        message: "Contact to Admin for Account Activation",
        error: true,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return res
        .status(401)
        .json({ message: "Incorrect password", error: true });
    }

    const accessToken = await generatedAccessToken(user._id);
    const refreshToken = await generatedRefreshToken(user._id);

    //Handle potential token generation errors
    if (!accessToken || !refreshToken) {
      console.error("Error generating tokens."); // Log for debugging
      return res.status(500).json({
        message: "Login failed. Please try again later.",
        error: true,
      });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set secure only in production
      sameSite: "none",
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({
      message: "Login Successful 👍",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Login failed. Please try again later.", error: true });
  }
};

// logout Controller
export const logoutController = async (req, res) => {
  try {
    const userid = req.userId;
    // console.log("this userid from controller received from auth",userid);  // coming from the auth  middleware line no-28
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false, // Only secure in production
      sameSite: "none",
    };

    //Clear cookies - Note the order is important for sameSite=none
    res.clearCookie("refreshToken", cookieOptions);
    res.clearCookie("accessToken", cookieOptions);

    // after auth middleware getting the userid now we are going to remove the token from the database;

    const removeRefreshToken = await UserModel.findByIdAndUpdate(userid, {
      refresh_token: "",
    });

    res.status(200).json({
      message: "Logout Successful",
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Logout error:", error); // Log the error for debugging
    res.status(500).json({
      message: "Logout failed", // More user-friendly message
      error: true,
      success: false,
    });
  }
};

// upload user avatar
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.userId; // coming from the auth middleware

    const image = req.file; // comign from the multer middleware  // file that is coming from frontend or postman
    const upload = await uploadImageCloudinary(image); //here we are uploading the image
    // now we are storing this image in data base
    // so only login user can upload so get the user Id from the auth userId
console.log("upload is ",await upload);
    const updateAvatar = await UserModel.findByIdAndUpdate(userId, {
      avatar:await upload.url
    });

    console.log(updateAvatar);
    return res.json({
      message: "Avatat Uploaded",
      data: {
        _id: userId,
        avatar: upload.url
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
