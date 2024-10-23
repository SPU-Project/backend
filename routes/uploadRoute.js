const express = require("express");
const upload = require("../middleware/uploadMiddleware.js");
const {
  uploadProfileImage,
  getProfileImage,
} = require("../controllers/uploadController.js");

const router = express.Router();

router.post(
  "/upload-profile",
  upload.single("profileImage"),
  uploadProfileImage
);
router.get("/profile-image", getProfileImage); // Route baru untuk mendapatkan gambar profil

module.exports = router;
