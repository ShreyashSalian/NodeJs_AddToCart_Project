import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};
function getPublicIdFromUrl(url) {
  // Split the URL by '/' to get an array of parts
  const parts = url.split("/");

  // The public ID is the last part of the URL, without the file extension
  const publicIdWithExtension = parts[parts.length - 1];

  // Remove the file extension (e.g., '.png' or '.jpg') to get the public ID
  const publicId = publicIdWithExtension.split(".")[0];

  return publicId;
}

const deleteFromCloudinary = async (filePath) => {
  try {
    const publicID = getPublicIdFromUrl(filePath);

    const result = await cloudinary.uploader.destroy(publicID);
    console.log("Delete result:", result);
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
