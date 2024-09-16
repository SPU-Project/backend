// routes/uploadRoute.js

import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  uploadProfileImage,
  getProfileImage,
} from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/upload-profile",
  upload.single("profileImage"),
  uploadProfileImage
);
router.get("/profile-image", getProfileImage); // Route baru untuk mendapatkan gambar profil

export default router;
