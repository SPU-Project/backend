// controllers/uploadController.js

const Admin = require("../models/AdminModel.js");
const path = require("path");
const fs = require("fs").promises; // Menggunakan fs dengan promises

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.session.userId; // Mengambil userId dari session

    if (!userId) {
      return res.status(401).json({ message: "Anda belum login" });
    }

    const filePath = req.file.path;

    const admin = await Admin.findByPk(userId);
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    admin.profileImage = filePath;
    await admin.save();

    res.status(200).json({
      message: "Gambar profil berhasil diunggah",
      profileImage: filePath,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal mengunggah gambar profil",
      error: error.message,
    });
  }
};

const getProfileImage = async (req, res) => {
  try {
    const userId = req.session.userId; // Ambil userId dari session

    if (!userId) {
      return res.status(401).json({ message: "Anda belum login" });
    }

    // Cari admin berdasarkan userId
    const admin = await Admin.findByPk(userId);
    if (!admin || !admin.profileImage) {
      // Jika admin tidak ditemukan atau tidak memiliki gambar profil
      const defaultImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "default-profile-image.png"
      );
      return res.status(200).sendFile(defaultImagePath);
    }

    // Tentukan path gambar profil
    const profileImagePath = path.join(__dirname, "..", admin.profileImage);

    // Pastikan file gambar ada
    try {
      await fs.access(profileImagePath);
    } catch (error) {
      // Jika file tidak ditemukan, kirim gambar default
      const defaultImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "default-profile-image.png"
      );
      return res.status(200).sendFile(defaultImagePath);
    }

    // Kirim file gambar profil sebagai respons
    res.status(200).sendFile(profileImagePath);
  } catch (error) {
    console.error("Error saat mendapatkan gambar profil:", error);
    // Jika terjadi error, kirim gambar default
    const defaultImagePath = path.join(
      __dirname,
      "..",
      "uploads",
      "default-profile-image.png"
    );
    res.status(200).sendFile(defaultImagePath);
  }
};

module.exports = { uploadProfileImage, getProfileImage };
