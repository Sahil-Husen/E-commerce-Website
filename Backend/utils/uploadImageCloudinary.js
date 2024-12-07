import { v2 as cloudinary } from "cloudinary"; 

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret :process.env.API_SECRET,
    
})

const uploadImageCloudinary = async (image) => {
  const buffer = image?.buffer || Buffer.from(await Image.arrayBuffer());
  const uploadImage = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "Blinkit" },
      (error, uploadResult) => {
        return resolve(uploadResult)
      }
    ).end(buffer)
  });

  return uploadImage;
};
export default uploadImageCloudinary;