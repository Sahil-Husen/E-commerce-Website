import { Router } from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  refreshToken,
  registerUser,
  resetPassword,
  updateUserDetails,
  uploadAvatar,
  varifyEmailController,
  varifyForgotPasswordOTP,
} from "../controllers/users.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/varify-email", varifyEmailController); // this api is not tested
userRouter.post("/login", loginController);
userRouter.get("/logout", auth, logoutController);
userRouter.put("/upload-avatar", auth, upload.single("avatar"), uploadAvatar); // only login user can access it so we use auth middle ware

userRouter.put("/update-user",auth,updateUserDetails)
userRouter.put("/forgot-password",forgotPasswordController)
userRouter.put("/verify-forgot-password-otp",varifyForgotPasswordOTP)
userRouter.put("/reset-password",resetPassword)
userRouter.post("/refresh-token",refreshToken)

export default userRouter;
