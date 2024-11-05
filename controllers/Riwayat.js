const RiwayatLog = require("../models/RiwayatLog.js");

// Fungsi untuk mendapatkan semua data Riwayat Log
const getAllRiwayat = async (req, res) => {
  try {
    // Ambil semua data dari model RiwayatLog
    const riwayatList = await RiwayatLog.findAll({
      order: [["date", "DESC"]], // Mengurutkan berdasarkan tanggal terbaru
    });

    res.status(200).json({
      message: "Daftar Riwayat Log",
      data: riwayatList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal Mengambil Daftar Riwayat Log",
      error: error.message,
    });
  }
};

module.exports = {
  getAllRiwayat,
};
