const db = require("../config/Database.js");
const sequelize = db; // Assuming db exports the Sequelize instance

const StokBahanBaku = require("../models/StokBahanBakuModel.js");
const BahanBakuModel = require("../models/BahanBakuModel.js");
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
//Update
const updateStokBahanBaku = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { Stok } = req.body;

    // Cari stok berdasarkan id
    const stokbahanbaku = await StokBahanBaku.findByPk(id, { transaction });
    if (!stokbahanbaku) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "Stok Bahan Baku tidak ditemukan" });
    }

    // Simpan stok lama untuk log
    const oldstokbahanbaku = stokbahanbaku.Stok;

    // Update stok dan tanggal
    stokbahanbaku.Stok = Stok;
    stokbahanbaku.TanggalPembaruan = new Date();

    // Simpan perubahan
    await stokbahanbaku.save({ transaction });

    // Dapatkan informasi pengguna
    const user = await getUserInfo(req);

    // Buat log ke RiwayatLog
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

    // Commit transaction agar data persisten di DB
    await transaction.commit();

    // Ambil ulang data beserta relasi BahanBakuModel untuk dapatkan Satuan
    const updatedItem = await StokBahanBaku.findOne({
      where: { id },
      include: [{ model: BahanBakuModel, attributes: ["Satuan"] }],
    });

    // Flatten data agar format sama dengan getAllStokBahanBaku
    const data = {
      id: updatedItem.id,
      BahanBakuId: updatedItem.BahanBakuId,
      BahanBaku: updatedItem.BahanBaku, // Jika BahanBaku disimpan di kolom ini
      Stok: updatedItem.Stok,
      Satuan: updatedItem.bahanbakumodel
        ? updatedItem.bahanbakumodel.Satuan
        : null,
      TanggalPembaruan: updatedItem.TanggalPembaruan,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt,
    };

    // Kembalikan respons
    res.status(200).json({
      message: "Stok Bahan Baku Berhasil Diupdate",
      data: data,
    });
  } catch (error) {
    // Rollback transaction jika error
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
    const stokbahanbakulist = await StokBahanBaku.findAll({
      include: [{ model: BahanBakuModel, attributes: ["Satuan"] }],
    });

    const data = stokbahanbakulist.map((item) => {
      return {
        id: item.id,
        BahanBakuId: item.BahanBakuId,
        BahanBaku: item.BahanBaku, // jika di DB kolom ini terpisah, pakai item.BahanBaku
        Stok: item.Stok,
        // Ambil Satuan dari relasi BahanBakuModel
        Satuan: item.bahanbakumodel ? item.bahanbakumodel.Satuan : null,
        TanggalPembaruan: item.TanggalPembaruan,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    res.status(200).json({
      message: "Daftar Stok Bahan Baku",
      data: data,
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
