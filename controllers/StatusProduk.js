const StatusProduksiModel = require("../models/StatusProduksiModel.js");
const ProdukModel = require("../models/ProdukModel.js");
const { Op } = require("sequelize");
const RiwayatLog = require("../models/RiwayatLog.js");
const Admin = require("../models/AdminModel.js");

// Import database instance untuk transaksi
const db = require("../config/Database.js");
const sequelize = db;

// Helper: mendapatkan info user
const getUserInfo = async (req) => {
  if (!req.session.userId) return null;
  const user = await Admin.findOne({
    attributes: ["username", "role"],
    where: { id: req.session.userId },
  });
  return user;
};

// GET ALL
exports.getAllStatusProduksi = async (req, res) => {
  try {
    const items = await StatusProduksiModel.findAll();
    res.status(200).json({
      message: "Berhasil mengambil semua data StatusProduksi",
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data StatusProduksi",
      error: error.message,
    });
  }
};

// GET BY ID
exports.getStatusProduksiById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await StatusProduksiModel.findByPk(id);
    if (!item) {
      return res
        .status(404)
        .json({ message: "Data StatusProduksi tidak ditemukan" });
    }
    res.status(200).json({
      message: "Berhasil mengambil data StatusProduksi",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data StatusProduksi",
      error: error.message,
    });
  }
};

// CREATE StatusProduksi dengan transaksi dan log Riwayat
exports.createStatusProduksi = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      KodeProduksi,
      TanggalProduksi,
      TanggalSelesai,
      Batch,
      Satuan,
      JumlahProduksi,
      StatusProduksi,
    } = req.body;

    // Cek KodeProduksi di ProdukModel
    const foundProduct = await ProdukModel.findOne({
      where: { KodeProduksi },
      transaction,
    });
    if (!foundProduct) {
      await transaction.rollback();
      return res.status(404).json({
        message: "KodeProduksi yang anda cari tidak ditemukan",
      });
    }

    // Pengecekan unik (KodeProduksi, Batch)
    const existingCombo = await StatusProduksiModel.findOne({
      where: { KodeProduksi, Batch },
      transaction,
    });
    if (existingCombo) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Pada KodeProduksi ${KodeProduksi}, Batch '${Batch}' sudah ada. Harap gunakan Batch berbeda.`,
      });
    }

    // Ambil NamaProduk dari ProdukModel
    const namaProdukDariProdukModel = foundProduct.namaProduk;

    // Buat record di StatusProduksiModel
    const newItem = await StatusProduksiModel.create(
      {
        KodeProduksi,
        TanggalProduksi,
        TanggalSelesai,
        NamaProduk: namaProdukDariProdukModel,
        Batch,
        Satuan,
        JumlahProduksi,
        StatusProduksi,
      },
      { transaction }
    );

    // Simpan log Riwayat
    const user = await getUserInfo(req);
    if (user) {
      await RiwayatLog.create(
        {
          username: user.username,
          role: user.role,
          description: `Menambahkan Status Produksi: ${namaProdukDariProdukModel} dengan Batch ${Batch}`,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res.status(201).json({
      message: "StatusProduksi berhasil ditambahkan",
      data: newItem,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: "Gagal menambahkan StatusProduksi",
      error: error.message,
    });
  }
};

// UPDATE StatusProduksi dengan transaksi dan log Riwayat
exports.updateStatusProduksi = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      KodeProduksi,
      TanggalProduksi,
      TanggalSelesai,
      NamaProduk,
      Batch,
      Satuan,
      JumlahProduksi,
      StatusProduksi,
    } = req.body;

    const item = await StatusProduksiModel.findByPk(id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "Data StatusProduksi tidak ditemukan" });
    }

    // Pengecekan unik (KodeProduksi, Batch) untuk update
    const existingCombo = await StatusProduksiModel.findOne({
      where: {
        KodeProduksi,
        Batch,
        id: { [Op.ne]: id },
      },
      transaction,
    });
    if (existingCombo) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Untuk KodeProduksi=${KodeProduksi}, Batch '${Batch}' sudah terpakai. Gunakan batch lain.`,
      });
    }

    // Update field
    item.KodeProduksi = KodeProduksi;
    item.TanggalProduksi = TanggalProduksi;
    item.TanggalSelesai = TanggalSelesai;
    item.NamaProduk = NamaProduk;
    item.Batch = Batch;
    item.Satuan = Satuan;
    item.JumlahProduksi = JumlahProduksi;
    item.StatusProduksi = StatusProduksi;

    await item.save({ transaction });

    // Simpan log Riwayat
    const user = await getUserInfo(req);
    if (user) {
      await RiwayatLog.create(
        {
          username: user.username,
          role: user.role,
          description: `Mengupdate Status Produksi: ${NamaProduk} dengan Batch ${Batch}`,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res.status(200).json({
      message: "StatusProduksi berhasil diperbarui",
      data: item,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: "Gagal memperbarui StatusProduksi",
      error: error.message,
    });
  }
};

// DELETE StatusProduksi dengan transaksi dan log Riwayat
exports.deleteStatusProduksi = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const item = await StatusProduksiModel.findByPk(id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "Data StatusProduksi tidak ditemukan" });
    }

    await item.destroy({ transaction });

    // Simpan log Riwayat
    const user = await getUserInfo(req);
    if (user) {
      await RiwayatLog.create(
        {
          username: user.username,
          role: user.role,
          description: `Menghapus Status Produksi: ${item.NamaProduk} dengan Batch ${item.Batch}`,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res.status(200).json({
      message: "StatusProduksi berhasil dihapus",
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: "Gagal menghapus StatusProduksi",
      error: error.message,
    });
  }
};
