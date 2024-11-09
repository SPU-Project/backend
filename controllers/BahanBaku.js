const db = require("../config/Database.js");
const sequelize = db; // Assuming db exports the Sequelize instance

const BahanBakuModel = require("../models/BahanBakuModel");
const ProdukBahanBakuModel = require("../models/ProdukBahanBakuModel.js");
const StokBahanBaku = require("../models/StokBahanBakuModel.js");
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

const addBahanBaku = async (req, res) => {
  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    const { BahanBaku, Harga } = req.body;

    // Create a new record in the BahanBakuModel
    const newBahanBaku = await BahanBakuModel.create(
      {
        BahanBaku,
        Harga,
      },
      { transaction }
    );

    // Create the related entry in StokBahanBaku
    await StokBahanBaku.create(
      {
        BahanBakuId: newBahanBaku.id, // Foreign key to BahanBakuModel
        BahanBaku: newBahanBaku.BahanBaku, // Name of the BahanBaku
        // TanggalPembaruan will be set automatically to current date/time
      },
      { transaction }
    );

    // Get user info
    const user = await getUserInfo(req);

    // Save log to RiwayatLog
    if (user) {
      await RiwayatLog.create(
        {
          username: user.username,
          role: user.role,
          description: `Menambahkan Bahan Baku: ${BahanBaku}`,
        },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      message: "Bahan Baku Berhasil Ditambahkan",
      data: newBahanBaku,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();

    res.status(400).json({
      message: "Gagal Menambahkan Bahan Baku",
      error: error.message,
    });
  }
};

//Read
const updateBahanBaku = async (req, res) => {
  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { BahanBaku, Harga } = req.body;

    const bahanBaku = await BahanBakuModel.findByPk(id, { transaction });
    if (!bahanBaku) {
      await transaction.rollback();
      return res.status(404).json({ message: "Bahan Baku tidak ditemukan" });
    }

    // Save old data for logging
    const oldBahanBaku = bahanBaku.BahanBaku;

    // Update fields in BahanBakuModel
    bahanBaku.BahanBaku = BahanBaku;
    bahanBaku.Harga = Harga;

    await bahanBaku.save({ transaction });

    // Update the corresponding StokBahanBaku
    const stokBahanBaku = await StokBahanBaku.findOne({
      where: { BahanBakuId: id },
      transaction,
    });

    if (stokBahanBaku) {
      stokBahanBaku.BahanBaku = BahanBaku;
      stokBahanBaku.TanggalPembaruan = Sequelize.NOW;
      await stokBahanBaku.save({ transaction });
    }

    // Get user info
    const user = await getUserInfo(req);

    // Save log to RiwayatLog
    if (user) {
      await RiwayatLog.create(
        {
          username: user.username,
          role: user.role,
          description: `Mengupdate Bahan Baku dari ${oldBahanBaku} ke ${BahanBaku}`,
        },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: "Bahan Baku Berhasil Diupdate",
      data: bahanBaku,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    console.error("Error updating Bahan Baku:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
const deleteBahanBaku = async (req, res) => {
  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    // Find the BahanBaku record by id
    const bahanBaku = await BahanBakuModel.findByPk(id, { transaction });
    if (!bahanBaku) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Bahan Baku tidak ditemukan",
      });
    }

    // Check if the Bahan Baku is used by any Produk
    const produkBahanBaku = await ProdukBahanBakuModel.findOne({
      where: {
        bahanBakuId: id,
      },
      transaction,
    });

    if (produkBahanBaku) {
      await transaction.rollback();
      return res.status(400).json({
        message:
          "Bahan Baku tidak dapat dihapus karena sedang digunakan oleh Produk",
      });
    }

    // Save BahanBaku name for logging
    const namaBahanBaku = bahanBaku.BahanBaku;

    // Delete the corresponding StokBahanBaku record
    const stokBahanBaku = await StokBahanBaku.findOne({
      where: { BahanBakuId: id },
      transaction,
    });

    if (stokBahanBaku) {
      await stokBahanBaku.destroy({ transaction });
    }

    // Delete the BahanBaku record
    await bahanBaku.destroy({ transaction });

    // Get user info
    const user = await getUserInfo(req);

    // Save log to RiwayatLog
    if (user) {
      await RiwayatLog.create(
        {
          username: user.username,
          role: user.role,
          description: `Menghapus Bahan Baku: ${namaBahanBaku}`,
        },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: "Bahan Baku Berhasil Dihapus",
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
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
