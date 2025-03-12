const PenjualanProdukModel = require("../models/PenjualanProdukModel.js");
const ProdukModel = require("../models/ProdukModel.js");
const StatusProduksiModel = require("../models/StatusProduksiModel.js");
const { Op } = require("sequelize");
const RiwayatLog = require("../models/RiwayatLog.js");
const Admin = require("../models/AdminModel.js");

// Helper function untuk mendapatkan info user
const getUserInfo = async (req) => {
  if (!req.session.userId) return null;
  const user = await Admin.findOne({
    attributes: ["username", "role"],
    where: { id: req.session.userId },
  });
  return user;
};

// Daftar margin yang diperbolehkan
const VALID_MARGINS = [
  "20%",
  "30%",
  "40%",
  "50%",
  "60%",
  "70%",
  "80%",
  "90%",
  "100%",
];

/**
 * GET ALL
 * URL: GET /penjualan-produk
 */
exports.getAllPenjualanProduk = async (req, res) => {
  try {
    const items = await PenjualanProdukModel.findAll();
    res.status(200).json({
      message: "Data PenjualanProduk berhasil diambil",
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data PenjualanProduk",
      error: error.message,
    });
  }
};

/**
 * GET BY ID
 * URL: GET /penjualan-produk/:id
 */
exports.getPenjualanProdukById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await PenjualanProdukModel.findByPk(id);
    if (!item) {
      return res
        .status(404)
        .json({ message: "PenjualanProduk tidak ditemukan" });
    }

    res.status(200).json({
      message: "Berhasil mengambil data PenjualanProduk",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data PenjualanProduk",
      error: error.message,
    });
  }
};

/**
 * CREATE
 * URL: POST /penjualan-produk
 * Body: { NamaProduk, Batch, Margin, (optional Terjual) }
 */
exports.createPenjualanProduk = async (req, res) => {
  try {
    const { NamaProduk, Batch, Margin, Terjual } = req.body;

    // 1) Validasi body minimal
    if (!NamaProduk || !Batch || !Margin) {
      return res.status(400).json({
        message: "NamaProduk, Batch, dan Margin harus diisi",
      });
    }

    // 2) Validasi Margin
    if (!VALID_MARGINS.includes(Margin)) {
      return res.status(400).json({
        message: `Margin tidak valid. Hanya boleh: ${VALID_MARGINS.join(", ")}`,
      });
    }

    // 3) Cari di StatusProduksiModel => NamaProduk & Batch
    const statusData = await StatusProduksiModel.findOne({
      where: {
        NamaProduk,
        Batch,
      },
    });
    if (!statusData) {
      return res.status(404).json({
        message:
          "NamaProduk,Batch yang anda masukkan tidak ditemukan di StatusProduksiModel",
      });
    }

    // Dapatkan JumlahProduksi
    const { JumlahProduksi } = statusData; // string, mungkin perlu konversi ke number
    const jumlahProdNum = Number(JumlahProduksi) || 0;

    // 4) Cari di ProdukModel => namaProduk (huruf kecil) sama dengan NamaProduk
    const produkData = await ProdukModel.findOne({
      where: {
        namaProduk: NamaProduk,
      },
    });
    if (!produkData) {
      return res.status(404).json({
        message: "NamaProduk yang anda masukkan tidak ditemukan di ProdukModel",
      });
    }

    // Pilih kolom margin dari ProdukModel sesuai Margin input
    let marginValue = null;
    switch (Margin) {
      case "20%":
        marginValue = produkData.margin20;
        break;
      case "30%":
        marginValue = produkData.margin30;
        break;
      case "40%":
        marginValue = produkData.margin40;
        break;
      case "50%":
        marginValue = produkData.margin50;
        break;
      case "60%":
        marginValue = produkData.margin60;
        break;
      case "70%":
        marginValue = produkData.margin70;
        break;
      case "80%":
        marginValue = produkData.margin80;
        break;
      case "90%":
        marginValue = produkData.margin90;
        break;
      case "100%":
        marginValue = produkData.margin100;
        break;
    }
    if (!marginValue) {
      return res.status(400).json({
        message: `Margin ${Margin} tidak tersedia di ProdukModel`,
      });
    }

    // Hitung HargaSatuan = marginValue / jumlahProdNum (hindari division by zero)
    const hargaSatuan =
      jumlahProdNum === 0 ? 0 : Number(marginValue) / jumlahProdNum;

    // Terjual (optional)
    const terjualNum = Number(Terjual) || 0;

    // Hitung Pendapatan = hargaSatuan * terjualNum
    const pendapatan = hargaSatuan * terjualNum;

    // Simpan ke PenjualanProdukModel
    const newItem = await PenjualanProdukModel.create({
      NamaProduk,
      Batch,
      JumlahProduksi: jumlahProdNum,
      Margin,
      Terjual: terjualNum,
      HargaSatuan: hargaSatuan,
      Pendapatan: pendapatan,
    });

    // Integrasi Riwayat Log: Catat aktivitas pembuatan
    const user = await getUserInfo(req);
    if (user) {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: `Menambahkan Penjualan Produk: ${NamaProduk} Batch ${Batch} dengan Margin ${Margin}`,
      });
    }

    res.status(201).json({
      message: "Data Penjualan Produk berhasil ditambahkan",
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambahkan PenjualanProduk",
      error: error.message,
    });
  }
};

/**
 * UPDATE
 * URL: PATCH /penjualan-produk/:id
 * Body: { NamaProduk, Batch, Margin, (optional Terjual) }
 */
exports.updatePenjualanProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { NamaProduk, Batch, Margin, Terjual } = req.body;

    const item = await PenjualanProdukModel.findByPk(id);
    if (!item) {
      return res
        .status(404)
        .json({ message: "Data PenjualanProduk tidak ditemukan" });
    }

    // Validasi minimal
    if (!NamaProduk || !Batch || !Margin) {
      return res.status(400).json({
        message: "NamaProduk, Batch, dan Margin harus diisi",
      });
    }

    // Validasi Margin
    if (!VALID_MARGINS.includes(Margin)) {
      return res.status(400).json({
        message: `Margin tidak valid. Hanya boleh: ${VALID_MARGINS.join(", ")}`,
      });
    }

    // Cari di StatusProduksiModel => NamaProduk & Batch
    const statusData = await StatusProduksiModel.findOne({
      where: { NamaProduk, Batch },
    });
    if (!statusData) {
      return res.status(404).json({
        message:
          "NamaProduk,Batch yang anda masukkan tidak ditemukan di StatusProduksiModel",
      });
    }
    const jumlahProdNum = Number(statusData.JumlahProduksi) || 0;

    // Cari di ProdukModel => namaProduk
    const produkData = await ProdukModel.findOne({
      where: { namaProduk: NamaProduk },
    });
    if (!produkData) {
      return res.status(404).json({
        message: "NamaProduk yang anda masukkan tidak ditemukan di ProdukModel",
      });
    }

    // Pilih marginValue dari ProdukModel
    let marginValue = null;
    switch (Margin) {
      case "20%":
        marginValue = produkData.margin20;
        break;
      case "30%":
        marginValue = produkData.margin30;
        break;
      case "40%":
        marginValue = produkData.margin40;
        break;
      case "50%":
        marginValue = produkData.margin50;
        break;
      case "60%":
        marginValue = produkData.margin60;
        break;
      case "70%":
        marginValue = produkData.margin70;
        break;
      case "80%":
        marginValue = produkData.margin80;
        break;
      case "90%":
        marginValue = produkData.margin90;
        break;
      case "100%":
        marginValue = produkData.margin100;
        break;
    }
    if (!marginValue) {
      return res.status(400).json({
        message: `Margin ${Margin} tidak tersedia di ProdukModel`,
      });
    }

    const hargaSatuan =
      jumlahProdNum === 0 ? 0 : Number(marginValue) / jumlahProdNum;
    const terjualNum = Number(Terjual) || 0;
    const pendapatan = hargaSatuan * terjualNum;

    // Update fields
    item.NamaProduk = NamaProduk;
    item.Batch = Batch;
    item.JumlahProduksi = jumlahProdNum;
    item.Margin = Margin;
    item.Terjual = terjualNum;
    item.HargaSatuan = hargaSatuan;
    item.Pendapatan = pendapatan;

    await item.save();

    // Integrasi Riwayat Log: Catat aktivitas update
    const user = await getUserInfo(req);
    if (user) {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: `Mengupdate Penjualan Produk: ${NamaProduk} Batch ${Batch} ke Terjual ${terjualNum}`,
      });
    }

    res.status(200).json({
      message: "Data Penjualan Produk berhasil diperbarui",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal memperbarui PenjualanProduk",
      error: error.message,
    });
  }
};

/**
 * DELETE
 * URL: DELETE /penjualan-produk/:id
 */
exports.deletePenjualanProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await PenjualanProdukModel.findByPk(id);
    if (!item) {
      return res
        .status(404)
        .json({ message: "Data PenjualanProduk tidak ditemukan" });
    }

    await item.destroy();

    // Integrasi Riwayat Log: Catat aktivitas delete
    const user = await getUserInfo(req);
    if (user) {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: `Menghapus Penjualan Produk: ${item.NamaProduk} Batch ${item.Batch}`,
      });
    }

    res.status(200).json({
      message: "PenjualanProduk berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus PenjualanProduk",
      error: error.message,
    });
  }
};
