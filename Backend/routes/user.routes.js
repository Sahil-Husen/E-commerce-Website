import { Router } from "express";
import {
  registerUser,
  varifyEmailController,
} from "../controllers/users.controller.js";

const userRouter = Router(); 

userRouter.post("/register", registerUser);
userRouter.post("/varify-email", varifyEmailController);  // this api is not tested

export default userRouter;
