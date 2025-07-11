const express = require("express")
const router = express.Router()
const cloudinaryController = require("../controllers/cloudinary.controller")
const uploader = require("../middlewares/cloudinary.middlewares")


router.post("/", uploader.single("image"), cloudinaryController.uploadImage);
router.post("/pdf", uploader.single("file"), cloudinaryController.uploadImage);

export default router;