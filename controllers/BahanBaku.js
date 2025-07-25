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
    const { BahanBaku, Satuan, Harga } = req.body;

    // Pastikan Harga disimpan sebagai angka desimal dengan titik sebagai pemisah
    const parsedHarga = parseFloat(String(Harga).replace(",", "."));

    if (isNaN(parsedHarga)) {
      return res
        .status(400)
        .json({ message: "Harga harus berupa angka desimal yang valid" });
    }

    // Validasi: Pastikan Satuan maksimal 3 huruf
    if (!/^[A-Za-z]{1,3}$/.test(Satuan)) {
      return res.status(400).json({
        message: "Satuan harus terdiri dari maksimal 3 huruf saja",
      });
    }

    // Gunakan parsedHarga untuk menyimpan ke database
    const newBahanBaku = await BahanBakuModel.create(
      { BahanBaku, Satuan, Harga: parsedHarga },
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
  // Mulai transaksi
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    let { BahanBaku: newName, Satuan: newSatuan, Harga: newHarga } = req.body;

    // Cari record bahan baku
    const bahanBaku = await BahanBakuModel.findByPk(id, { transaction });
    if (!bahanBaku) {
      await transaction.rollback();
      return res.status(404).json({ message: "Bahan Baku tidak ditemukan" });
    }

    // Fallback ke data lama jika request kosong atau undefined
    newName    = newName    && newName.trim()    !== "" ? newName    : bahanBaku.BahanBaku;
    newSatuan  = newSatuan  && newSatuan.trim()  !== "" ? newSatuan  : bahanBaku.Satuan;
    newHarga   = newHarga   != null                ? newHarga   : bahanBaku.Harga;

    // Validasi: Satuan maksimal 3 huruf
    if (!/^[A-Za-z]{1,3}$/.test(newSatuan)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Satuan harus terdiri dari maksimal 3 huruf saja",
      });
    }

    // Simpan old value untuk log
    const oldName = bahanBaku.BahanBaku;

    // Update bahan baku
    bahanBaku.BahanBaku = newName;
    bahanBaku.Satuan    = newSatuan;
    bahanBaku.Harga     = newHarga;
    await bahanBaku.save({ transaction });

    // Upsert stok bahan baku
    const [stok, created] = await StokBahanBaku.findOrCreate({
      where: { BahanBakuId: id },
      defaults: {
        BahanBakuId: id,
        BahanBaku:   newName,
        Satuan:      newSatuan,
        Harga:       newHarga,
        // TanggalPembaruan otomatis kalau ada hook di model
      },
      transaction,
    });

    if (!created) {
      // Kalau sudah ada, cek perubahan data
      const isSame =
        stok.BahanBaku === newName &&
        stok.Satuan    === newSatuan &&
        stok.Harga     === newHarga;

      if (!isSame) {
        // Data berbeda → overwrite semua field
        stok.BahanBaku      = newName;
        stok.Satuan         = newSatuan;
        stok.Harga          = newHarga;
      }
      // Selalu update tanggal pembaruan
      stok.TanggalPembaruan = new Date();
      await stok.save({ transaction });
    }

    // Ambil user untuk logging
    const user = await getUserInfo(req);
    if (user) {
      await RiwayatLog.create(
        {
          username:    user.username,
          role:        user.role,
          description: `Update Bahan Baku dari "${oldName}" → "${newName}"`,
        },
        { transaction }
      );
    }

    // Commit transaksi
    await transaction.commit();

    return res.status(200).json({
      message: "Bahan Baku berhasil diupdate",
      data:    bahanBaku,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating Bahan Baku:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error:   error.message,
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
