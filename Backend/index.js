import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
// import userRouter from "./routes/user.routes.js";
import userRouter from './routes/user.routes.js'
 
 
 

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());
app.use(morgan()); // for any api call it show in console
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

const PORT = 5000;
app.get("/", (req, res) => {
  res.json({ message: "Response from Server : " + PORT });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});

 app.use('/api/user',userRouter)