import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MONGODB_URL) {
  throw new Error('MongoDB URL not found');
}

const connectDB = async () => {
  try {
    console.log("MongoDB URL:", process.env.MONGODB_URL);
    mongoose.connect(process.env.MONGODB_URL, {
    
    })
      .then(() => console.log('Connected to MongoDB!'))
      .catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); // Exit the application if the connection fails
      });
    console.log('Database Connected Successfully');
  } catch (error) {
    console.log("Error in connecting to database");
    console.error("Error details:", error.message);
    process.exit(1);
  }
};

export default connectDB;
