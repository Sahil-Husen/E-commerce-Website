import { Router } from "express";
import {
    loginController,
  logoutController,
  registerUser,
  varifyEmailController,
} from "../controllers/users.controller.js";
import auth from "../middleware/auth.js";

const userRouter = Router();

userRouter.post("/register", registerUser);
userRouter.post("/varify-email", varifyEmailController); // this api is not tested
userRouter.post('/login',loginController)
userRouter.get('/logout',auth,logoutController)

export default userRouter;  
