import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import jsonwebtoken from "jsonwebtoken";
import UserModel from "../model/user.model.js";
import sendEmail from "../config/sendEmail.js";
import varifyEmailTemplate from "../utils/varifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import generateOTP from "../utils/generatedOtp.js";
import { forgotPasswordTemplate } from "../utils/forgotPasswordTemplate.js";

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
    console.log("upload is ", await upload);
    const updateAvatar = await UserModel.findByIdAndUpdate(userId, {
      avatar: await upload.url,
    });

    console.log(updateAvatar);
    return res.json({
      message: "Avatat Uploaded",
      data: {
        _id: userId,
        avatar: upload.url,
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

// update user details
export const updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId; // auth middleware
    const { name, email, password, mobile } = req.body;
    if (!(name || email || password || mobile)) {
      return res.json({
        message: "Please provide any value to update!😉",
        error: false,
        success: false,
      });
    }

    let hashedPassword = "";
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      hashedPassword = await bcryptjs.hash(password, salt);
    }

    const updateUser = await UserModel.updateOne(
      { _id: userId },
      {
        ...(name && { name: name }), // here we are using ADD operator for if name,email,password and mobile number is available from user end then it process the updation
        ...(email && { email: email }),
        ...(password && { password: hashedPassword }),
        ...(mobile && { mobile: mobile }),
      }
    );

    // when the update part is done then Send Response back.
    return res.json({
      message: "User Updated Successfully",
      error: false,
      success: true,
      data: {
        updateUser,
      },
    });
  } catch (error) {
    return res.send(500).json({
      messae: error.message || error,
      error: true,
      success: false,
    });
  }
};

// here forgot password api starts
// Forget Password not Login
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "User not Exist",
        error: true,
        success: false,
      });
    }

    const otp = generateOTP();
    const expireTime = new Date() + 60 * 60 * 1000; // 1 hr
    // now update  forgot_password_otp &&  forgot_password_expiry in database

    const update = await UserModel.findByIdAndUpdate(user._id, {
      forgot_password_otp: otp,
      forgot_password_expiry: new Date(expireTime).toISOString(),
    });

    console.log(update);
    // Send OTP email
    // this is from the ../config/sendEmail
    await sendEmail({
      sendTo: email,
      subject: "Forgot password OTP from Blinkeyit",
      html: forgotPasswordTemplate({
        name: user.name,
        otp: otp,
      }),
    });

    // Now send the response back to user
    return res.json({
      message: "OTP! Sent Check Your Email.",
      error: false,
      success: false,
      data: {
        otp: otp,
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

// Varify forgot password otp
export const varifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!(email || otp)) {
      return res.json({
        message: "Please Provide required fields email and otp",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email }); // find user in db
    if (!user) {
      return res.status(401).json({
        message: "User not Exist",
        error: true,
        success: false,
      });
    }

    const currentTime = new Date().toISOString;

    if (user.forgot_password_expiry > currentTime) {
      return res.json({
        message: "OTP expired",
        error: true,
        success: false,
      });
    }

    if (otp !== user.forgot_password_otp) {
      return res.json({
        message: "OTP is invalid",
        error: true,
        success: false,
      });
    }

    // if otp  is not expired and otp === user.forgot_password_otp
    return res.json({
      message: "OTP varification successful",
      error: false,
      success: true,
    });
  } catch (error) {
    return res.json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

// Reset the Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;
    // check email and password is provided or not

    if (!(email && newPassword && confirmPassword)) {
      return res.status(400).json({
        message: "Please provide all fields",
        error: true,
        success: false,
      });
    }

    const user = await UserModel.findOne({ email }); // check user exist in database or not
    if (!user) {
      return res.status(400).json({
        message: "Email is not present",
        error: true,
        success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password not matched",
        error: true,
        success: false,
      });
    }

    // now convert the password in hashed password using bcyptjs
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // now update or reset the password
    const update = await UserModel.findOneAndUpdate(user._id, {
      password: hashedPassword,
    });

    // now set response back to client

    return res.json({
      message: "Password Reset Successfully",
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
// here forgot password api ends

// now Refresh token Controller
export const refreshToken = async (req, res) => {
  try {
    const refreshToken =
      req.cookies.refreshToken || req?.header?.authorization?.split(" ")[1];
    if (!refreshToken) {
      return res.status(401).json({
        message: "Invalid Refresh token",
        error: true,
        success: false,
      });
    }

    const varifyToken = jwt.verify(
      refreshToken,
      process.env.SECRET_KEY_REFRESH_TOKEN
    );

    if (!varifyToken) {
      return res.status(401).json({
        message: "token is expired",
        error: true,
        success: false,
      });
    }

    const userId = varifyToken?._id;
    const newAccessToken = await generatedAccessToken(userId);
    // console.log(newAccessToken);
    // now send to cookies

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set secure only in production
      sameSite: "none",
    };

    res.cookie('accessToken',newAccessToken,cookieOptions)

    return res.json({
      message:"new access token generated using refresh token",
      error:false,
      success:true,
      data:{
        accessToken:newAccessToken
      }

    })

  
    
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};
