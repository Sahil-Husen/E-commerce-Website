import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

if(!(process.env.MONGODB_URL)){
    throw  new Error('Mongo url not found')
    
}
 const connectDBs = async ()=>{
    try {
     await   mongoose.connect(process.env.MONGODB_URL)
     console.log('Database Connected Successfully');
    } catch (error) {
        console.log("Error in connecting to database")
        console.log(error);
        process.exit(1)

    }
 }


 export default connectDBs;