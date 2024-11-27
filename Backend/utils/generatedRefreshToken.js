import UserModel from "../model/user.model.js";
import jwt from 'jsonwebtoken'
import dotenv  from 'dotenv'
dotenv.config()

if(!process.env.SECRET_KEY_REFRESH_TOKEN){
  console.log('Error Refresh token not found in .env');
}

const generatedRefreshToken =  async (userId) =>{
    const token = await jwt.sign({ id: userId }, process.env.SECRET_KEY_REFRESH_TOKEN, {
        expiresIn: "7d",
      });

        const updateRefreshTokenUser = await UserModel.updateOne(
            {_id:userId},
            {refresh_token:token}
        ) 

      return token;
}

export default generatedRefreshToken;