const BahanBakuModel = require("../models/BahanBakuModel");
const ProdukBahanBakuModel = require("../models/ProdukBahanBakuModel.js");
const Admin = require("../models/AdminModel.js");
const RiwayatLog = require("../models/RiwayatLog.js");

const getUserInfo = async (req) => {
  if (!req.session.userId) return null;
  const user = await Admin.findOne({
    attributes: ["username", "role"],
    where: {
      id: req.session.userId,
    },
  });
  return user;
};

// Function to add new Bahan Baku
//Create
const addBahanBaku = async (req, res) => {
  const getUserInfo = async (req) => {
    if (!req.session.userId) return null;
    const user = await Admin.findOne({
      attributes: ["username", "role"],
      where: {
        id: req.session.userId,
      },
    });
    return user;
  };

  try {
    const { BahanBaku, Harga } = req.body;

    // Create a new record in the BahanBakuModel
    const newBahanBaku = await BahanBakuModel.create({
      BahanBaku,
      Harga,
    });

    // Dapatkan informasi pengguna
    const user = await getUserInfo(req);

    // Simpan log ke RiwayatLog
    if (user) {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: `Menambahkan Bahan Baku: ${BahanBaku}`,
      });
    }

    res.status(201).json({
      message: "Bahan Baku Berhasil Ditambahkan",
      data: newBahanBaku,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal Menambahkan Bahan Baku",
      error: error.message,
    });
  }
};

//Read

//Update
// Function to update a Bahan Baku by id
const updateBahanBaku = async (req, res) => {
  try {
    const { id } = req.params;
    const { BahanBaku, Harga } = req.body;

    const bahanBaku = await BahanBakuModel.findByPk(id);
    if (!bahanBaku) {
      return res.status(404).json({ message: "Bahan Baku tidak ditemukan" });
    }

    // Simpan data lama untuk log
    const oldBahanBaku = bahanBaku.BahanBaku;

    // Update fields
    bahanBaku.BahanBaku = BahanBaku;
    bahanBaku.Harga = Harga;

    await bahanBaku.save();

    // Dapatkan informasi pengguna
    const user = await getUserInfo(req);

    // Simpan log ke RiwayatLog
    if (user) {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: `Mengupdate Bahan Baku dari ${oldBahanBaku} ke ${BahanBaku}`,
      });
    }

    res.status(200).json({
      message: "Bahan Baku Berhasil Diupdate",
      data: bahanBaku,
    });
  } catch (error) {
    console.error("Error updating Bahan Baku:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//Delete

const deleteBahanBaku = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the BahanBaku record by id
    const bahanBaku = await BahanBakuModel.findByPk(id);
    if (!bahanBaku) {
      return res.status(404).json({
        message: "Bahan Baku tidak ditemukan",
      });
    }

    // Check if the Bahan Baku is used by any Produk
    const produkBahanBaku = await ProdukBahanBakuModel.findOne({
      where: {
        bahanBakuId: id,
      },
    });

    if (produkBahanBaku) {
      return res.status(400).json({
        message:
          "Bahan Baku tidak dapat dihapus karena sedang digunakan oleh Produk",
      });
    }

    // Simpan nama bahan baku untuk log
    const namaBahanBaku = bahanBaku.BahanBaku;

    // Delete the BahanBaku record
    await bahanBaku.destroy();

    // Dapatkan informasi pengguna
    const user = await getUserInfo(req);

    // Simpan log ke RiwayatLog
    if (user) {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: `Menghapus Bahan Baku: ${namaBahanBaku}`,
      });
    }

    res.status(200).json({
      message: "Bahan Baku Berhasil Dihapus",
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal Menghapus Bahan Baku",
      error: error.message,
    });
  }
};

// Function to get all Bahan Baku
const getAllBahanBaku = async (req, res) => {
  try {
    // Fetch all records from BahanBakuModel
    const bahanBakuList = await BahanBakuModel.findAll();

    res.status(200).json({
      message: "Daftar Bahan Baku",
      data: bahanBakuList,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal Mengambil Daftar Bahan Baku",
      error: error.message,
    });
  }
};

module.exports = {
  addBahanBaku,
  updateBahanBaku,
  deleteBahanBaku,
  getAllBahanBaku,
};
