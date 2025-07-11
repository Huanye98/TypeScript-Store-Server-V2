import { v2 as cloudinary } from "cloudinary";
import CloudinaryStorage from "multer-storage-cloudinary"; 
import multer from "multer";
import dotenv from "dotenv";
import e from "express";

dotenv.config();

const config = {
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
};

if (!config.cloud_name || !config.api_key || !config.api_secret) {
  throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config(config);

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req,file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const params = { 
    folder: "my-app",
    allowed_formats: ["jpg", "png", "webp","pdf"]
  }
  if(ext === "pdf") {
    params.transformation = [{ quality: "auto", fetch_format: "webp" }];
  }
 return params;
}
});

export const uploader = multer({ storage });