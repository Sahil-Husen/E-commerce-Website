import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    // console.log("Cookies:", req.cookies); // Log all cookies
    // console.log("Headers:", req.headers); // Log all headers
    // const accessToken = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    // console.log("Access Token:", accessToken); // Log the token itself
    const token =
      req.cookies.accessToken || req.headers.authorization.split(" ")[1];
     
 
    if (!token) {
      return res.status(401).json({
        message:"Provide token! may be not set when login",
        error: true,
        success: false,
      });
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
    if (!decode) {
      return res.json({
        message: "Unauthorized Access",
        error: true,
        success: false,
      });
    }
    // console.log("decode",decode); this id is comming from the decoded object that is used to clear the refreshToken in database in logout controller
    req.userId = decode.id;

     
    next();
     
  } catch (error) {
    // ... error handling ...
    return res.json({
      message:"token not found please login",
      error:true,
      success:false
    })
  }
};
export default auth;
