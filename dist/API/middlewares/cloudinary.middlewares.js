"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploader = void 0;
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = __importDefault(require("multer-storage-cloudinary"));
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
dotenv_1.default.config();
const config = {
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
};
if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error("Missing Cloudinary environment variables");
}
cloudinary_1.v2.config(config);
const storage = new multer_storage_cloudinary_1.default({
    cloudinary: cloudinary_1.v2,
    params: async (req, file) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        const params = {
            folder: "my-app",
            allowed_formats: ["jpg", "png", "webp", "pdf"]
        };
        if (ext === "pdf") {
            params.transformation = [{ quality: "auto", fetch_format: "webp" }];
        }
        return params;
    }
});
exports.uploader = (0, multer_1.default)({ storage });
