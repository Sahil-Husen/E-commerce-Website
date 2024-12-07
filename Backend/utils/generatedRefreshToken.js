import UserModel from "../model/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generatedRefreshToken = async (userId) => {
  if (!process.env.SECRET_KEY_REFRESH_TOKEN) {
    console.error("Error: REFRESH_TOKEN_SECRET not found in .env");
    return null; // Indicate failure
  }

  try {
    const token = jwt.sign({ id: userId }, process.env.SECRET_KEY_REFRESH_TOKEN, {
      expiresIn: "7d",
    });

    //This uses upsert to avoid race condition
    const updateRefreshTokenUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { refresh_token: token },
      { upsert: true, new: true } // upsert creates if it doesn't exist, new returns updated doc
    );
    if(!updateRefreshTokenUser) {
        console.error("Error updating refresh token in database.");
        return null; // Indicate failure
    }
    return token;
  } catch (error) {
    console.error("Error generating or saving refresh token:", error);
    return null; // Indicate failure
  }
};

export default generatedRefreshToken;