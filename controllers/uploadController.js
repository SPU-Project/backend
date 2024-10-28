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
    // Tidak lagi memeriksa req.session.userId
    // const userId = req.session.userId;

    // Tidak lagi memeriksa apakah pengguna login
    // if (!userId) {
    //   return res.status(401).json({ message: "Anda belum login" });
    // }

    // Tidak lagi mencari admin berdasarkan userId
    // const admin = await Admin.findByPk(userId);

    // Tentukan direktori tempat gambar disimpan
    const imagesDirectory = path.join(
      __dirname,
      "..",
      "uploads",
      "profile-images"
    );

    // Pastikan direktori ada, jika tidak, lanjutkan
    try {
      await fs.access(imagesDirectory);
    } catch (error) {
      // Jika direktori tidak ada, lanjutkan tanpa error
    }

    // Baca semua file dalam direktori
    let files = [];
    try {
      files = await fs.readdir(imagesDirectory);
    } catch (error) {
      // Jika gagal membaca direktori, lanjutkan tanpa error
    }

    // Jika tidak ada file, kirim gambar default atau respons kosong
    if (!files || files.length === 0) {
      // Tentukan path gambar default
      const defaultImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "default-profile-image.png"
      );
      // Kirim gambar default sebagai respons
      return res.status(200).sendFile(defaultImagePath);
    }

    // Filter file berdasarkan ekstensi gambar (opsional)
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif"];
    const imageFiles = files.filter((file) => {
      return imageExtensions.includes(path.extname(file).toLowerCase());
    });

    // Jika tidak ada file gambar, kirim gambar default
    if (!imageFiles || imageFiles.length === 0) {
      const defaultImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "default-profile-image.png"
      );
      return res.status(200).sendFile(defaultImagePath);
    }

    // Temukan file gambar terbaru berdasarkan ctimeMs
    let latestFile;
    let latestTime = 0;

    for (const file of imageFiles) {
      const filePath = path.join(imagesDirectory, file);
      const stats = await fs.stat(filePath);
      if (stats.ctimeMs > latestTime) {
        latestTime = stats.ctimeMs;
        latestFile = filePath;
      }
    }

    // Jika tidak menemukan file terbaru, kirim gambar default
    if (!latestFile) {
      const defaultImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "default-profile-image.png"
      );
      return res.status(200).sendFile(defaultImagePath);
    }

    // Kirim file gambar terbaru sebagai respons
    res.status(200).sendFile(path.resolve(latestFile));
  } catch (error) {
    console.error("Error saat mendapatkan gambar profil:", error);
    // Tetap mengembalikan gambar default jika terjadi error
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
