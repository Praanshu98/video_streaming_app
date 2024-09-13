import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";
import unlinkFile from "./unlinkFile.js";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload a file
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // console.log("File Uploaded successfully");
    // console.log("uploadResult: ", uploadResult);
    // console.log(uploadResult.url);
    unlinkFile(localFilePath);
    // fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    console.error("Some error occurred: \n", error);
    unlinkFile(localFilePath);
    // fs.unlinkSync(localFilePath); // remove the locally saved temporary file
    return null;
  }
};

export { uploadToCloudinary };
