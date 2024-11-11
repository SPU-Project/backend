const db = require("../config/Database.js");
const sequelize = db; // Assuming db exports the Sequelize instance

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

//Update
// Function to update a Bahan Baku by id
const updateStokBahanBaku = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { Stok } = req.body;

    const stokbahanbaku = await StokBahanBaku.findByPk(id, { transaction });
    if (!stokbahanbaku) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "Stok Bahan Baku tidak ditemukan" });
    }

    // Save old data for logging
    const oldstokbahanbaku = stokbahanbaku.Stok;

    // Update fields
    stokbahanbaku.Stok = Stok;
    stokbahanbaku.TanggalPembaruan = new Date();

    await stokbahanbaku.save({ transaction });

    // Get user info
    const user = await getUserInfo(req);

    // Save log to RiwayatLog
    if (user) {
      await RiwayatLog.create(
        {
          username: user.username,
          role: user.role,
          description: `Mengupdate Stok Bahan Baku dari ${oldstokbahanbaku} ke ${Stok}`,
        },
        { transaction }
      );
    }

    // Commit the transaction
    await transaction.commit();

    res.status(200).json({
      message: "Stok Bahan Baku Berhasil Diupdate",
      data: stokbahanbaku,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    console.error("Error updating Stok Bahan Baku:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Function to get all Bahan Baku
const getAllStokBahanBaku = async (req, res) => {
  try {
    // Fetch all records from BahanBakuModel
    const stokbahanbakulist = await StokBahanBaku.findAll();

    res.status(200).json({
      message: "Daftar Stok Bahan Baku",
      data: stokbahanbakulist,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal Mengambil Daftar Stok Bahan Baku",
      error: error.message,
    });
  }
};

module.exports = {
  updateStokBahanBaku,
  getAllStokBahanBaku,
};
