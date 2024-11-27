import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import UserModel from "../model/user.model.js";
import sendEmail from "../config/sendEmail.js";
import varifyEmailTemplate from "../utils/varifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";

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

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({
        message: "Please provide Email & Password",
        error: true,
      });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }

    if (user.status !== "Active") {
      return res.status(400).json({
        message: "Contact to Admin",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcryptjs.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({
        message: "Check your password",
        error: true,
        success: false,
      });
    }
    //for login it is manadetory to provide accesstoken
    const accessToken = generatedAccessToken(user._id);
    const refreshToken = generatedRefreshToken(user._id);
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({
      message: "Login Successfull 👍",
      error: false,
      success: true,
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in login Server or api 🫥",
      error,
      error: true,
      success: false,
    });
  }
};

export const logoutController = async (req, res) => {
  console.log("Clearing cookies for logout...");

  try {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };
    

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      message: "Logout Successfull",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
