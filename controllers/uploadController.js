// controllers/uploadController.js
import Admin from "../models/AdminModel.js";
import path from "path"; // Tambahkan impor ini

export const uploadProfileImage = async (req, res) => {
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

export const getProfileImage = async (req, res) => {
  try {
    const userId = req.session.userId; // Mengambil userId dari session

    if (!userId) {
      return res.status(401).json({ message: "Anda belum login" });
    }

    const admin = await Admin.findByPk(userId);
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    if (!admin.profileImage) {
      return res.status(404).json({ message: "Gambar profil tidak ditemukan" });
    }

    // Mengirim file sebagai respons
    res.status(200).sendFile(path.resolve(admin.profileImage));
  } catch (error) {
    res.status(500).json({
      message: "Gagal mendapatkan gambar profil",
      error: error.message,
    });
  }
};
