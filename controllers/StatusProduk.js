const { Op } = require("sequelize");
const StatusProduksiModel = require("../models/StatusProduksiModel.js");
const ProdukModel = require("../models/ProdukModel.js");
const ProdukBahanBakuModel = require("../models/ProdukBahanBakuModel.js");
const StokBahanBaku = require("../models/StokBahanBakuModel.js");
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
      JumlahProduksi, // Nilai produksi yang dimasukkan (misalnya sebagai string, kemudian dikonversi)
      StatusProduksi,
    } = req.body;

    // Cek ProdukModel dengan KodeProduksi
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

    // Cek unik (KodeProduksi, Batch)
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
    const newStatus = await StatusProduksiModel.create(
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

    // Update stok bahan baku berdasarkan data di ProdukBahanBakuModel
    // Carilah semua record produk-bahan baku untuk ProdukModel tersebut
    const produkBahanBakus = await ProdukBahanBakuModel.findAll({
      where: { produkId: foundProduct.id },
      transaction,
    });

    const productionQty = parseFloat(JumlahProduksi) || 0;
    for (let pb of produkBahanBakus) {
      const usage = parseFloat(pb.jumlah) || 0;
      const deduction = productionQty * usage;
      // Cari record stok berdasarkan bahanBakuId
      const stokRecord = await StokBahanBaku.findOne({
        where: { BahanBakuId: pb.bahanBakuId },
        transaction,
      });
      if (!stokRecord) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Stok untuk bahan baku dengan ID ${pb.bahanBakuId} tidak ditemukan`,
        });
      }
      // (Opsional) Periksa kecukupan stok
      if (stokRecord.Stok < deduction) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Stok untuk bahan baku "${stokRecord.BahanBaku}" pada produksi "${namaProdukDariProdukModel}" kurang, Silahkan Tambahkan Stok Bahan Baku`,
        });
      }
      stokRecord.Stok = stokRecord.Stok - deduction;
      await stokRecord.save({ transaction });
    }

    // Simpan log ke RiwayatLog
    const user = await getUserInfo(req);
    if (user) {
      await RiwayatLog.create(
        {
          username: user.username,
          role: user.role,
          description: `Menambahkan Status Produksi: ${namaProdukDariProdukModel} dengan Batch ${Batch}. Jumlah Produksi: ${JumlahProduksi} telah dikurangkan dari stok bahan baku.`,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res.status(201).json({
      message: "StatusProduksi berhasil ditambahkan",
      data: newStatus,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      message: "Gagal menambahkan StatusProduksi",
      error: error.message,
    });
  }
};

/**
 * UPDATE Status Produksi
 * API: PATCH /status-produksi/:id
 */
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
      JumlahProduksi: newJumlahProduksi, // nilai baru
      StatusProduksi,
    } = req.body;

    // Ambil record StatusProduksi yang ada
    const statusItem = await StatusProduksiModel.findByPk(id, { transaction });
    if (!statusItem) {
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

    // Hitung perbedaan JumlahProduksi antara nilai baru dan lama
    const oldJumlah = parseFloat(statusItem.JumlahProduksi) || 0;
    const newJumlah = parseFloat(newJumlahProduksi) || 0;
    const difference = newJumlah - oldJumlah; // jika positif: produksi bertambah, jika negatif: berkurang

    // Update record StatusProduksi
    statusItem.KodeProduksi = KodeProduksi;
    statusItem.TanggalProduksi = TanggalProduksi;
    statusItem.TanggalSelesai = TanggalSelesai;
    statusItem.NamaProduk = NamaProduk;
    statusItem.Batch = Batch;
    statusItem.Satuan = Satuan;
    statusItem.JumlahProduksi = newJumlahProduksi;
    statusItem.StatusProduksi = StatusProduksi;
    await statusItem.save({ transaction });

    // Ambil ProdukModel berdasarkan KodeProduksi
    const foundProduct = await ProdukModel.findOne({
      where: { KodeProduksi },
      transaction,
    });
    if (!foundProduct) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Produk dengan KodeProduksi tersebut tidak ditemukan",
      });
    }

    // Sesuaikan stok pada StokBahanBakuModel berdasarkan perbedaan produksi
    const produkBahanBakus = await ProdukBahanBakuModel.findAll({
      where: { produkId: foundProduct.id },
      transaction,
    });

    for (let pb of produkBahanBakus) {
      const usage = parseFloat(pb.jumlah) || 0;
      const adjustment = difference * usage; // positif jika produksi naik, negatif jika turun
      const stokRecord = await StokBahanBaku.findOne({
        where: { BahanBakuId: pb.bahanBakuId },
        transaction,
      });
      if (!stokRecord) {
        await transaction.rollback();
        return res.status(404).json({
          message: `Stok untuk bahan baku dengan ID ${pb.bahanBakuId} tidak ditemukan`,
        });
      }
      if (adjustment > 0 && stokRecord.Stok < adjustment) {
        await transaction.rollback();
        return res.status(400).json({
          message: `Stok untuk bahan baku "${stokRecord.BahanBaku}" pada produksi "${NamaProduk}" kurang, Silahkan Tambahkan Stok Bahan Baku`,
        });
      }
      // Jika difference negatif, artinya produksi berkurang, sehingga stok ditambah kembali
      stokRecord.Stok = stokRecord.Stok - adjustment;
      await stokRecord.save({ transaction });
    }

    // Simpan log Riwayat
    const user = await getUserInfo(req);
    if (user) {
      await RiwayatLog.create(
        {
          username: user.username,
          role: user.role,
          description: `Mengupdate Status Produksi: ${NamaProduk} dengan Batch ${Batch}. Perubahan Jumlah Produksi: ${difference}.`,
        },
        { transaction }
      );
    }

    await transaction.commit();
    res.status(200).json({
      message: "StatusProduksi berhasil diperbarui",
      data: statusItem,
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
