import { Router } from "express";
import {
  loginController,
  logoutController,
  registerUser,
  uploadAvatar,
  varifyEmailController,
} from "../controllers/users.controller.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/varify-email", varifyEmailController); // this api is not tested
userRouter.post("/login", loginController);
userRouter.get("/logout", auth, logoutController);
userRouter.put("/upload-avatar", auth, upload.single("avatar"), uploadAvatar); // only login user can access it so we use auth middle ware

export default userRouter;
