// C:\Hasan\SV IPB\Semester 7\Backend\controllers\StatusProduk.js

const StatusProduksiModel = require("../models/StatusProduksiModel.js");
const ProdukModel = require("../models/ProdukModel.js");

// Ambil semua data StatusProduksi
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

// Ambil satu data StatusProduksi berdasarkan id
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

// Tambah data baru StatusProduksi
exports.createStatusProduksi = async (req, res) => {
  try {
    // Destruktur data dari body
    const {
      KodeProduksi,
      TanggalProduksi,
      TanggalSelesai,
      // NamaProduk, // <- DIHAPUS dari body agar user tidak perlu kirim
      Batch,
      Satuan,
      JumlahProduksi,
      StatusProduksi,
    } = req.body;

    // 1) Cek KodeProduksi di ProdukModel
    const foundProduct = await ProdukModel.findOne({
      where: { KodeProduksi },
    });

    // 2) Jika tidak ditemukan, return error
    if (!foundProduct) {
      return res.status(404).json({
        message: "KodeProduksi yang anda cari tidak ditemukan",
      });
    }

    // 3) Ambil namaProduk dari ProdukModel
    const namaProdukDariProdukModel = foundProduct.namaProduk;

    // 4) Buat record di StatusProduksiModel,
    //    isi NamaProduk dengan namaProdukDariProdukModel
    const newItem = await StatusProduksiModel.create({
      KodeProduksi,
      TanggalProduksi,
      TanggalSelesai,
      NamaProduk: namaProdukDariProdukModel, // isi otomatis dari ProdukModel
      Batch,
      Satuan,
      JumlahProduksi,
      StatusProduksi,
    });

    res.status(201).json({
      message: "StatusProduksi berhasil ditambahkan",
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menambahkan StatusProduksi",
      error: error.message,
    });
  }
};

// Update data StatusProduksi berdasarkan id
exports.updateStatusProduksi = async (req, res) => {
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

    const item = await StatusProduksiModel.findByPk(id);
    if (!item) {
      return res
        .status(404)
        .json({ message: "Data StatusProduksi tidak ditemukan" });
    }

    // Perbarui kolom
    item.KodeProduksi = KodeProduksi;
    item.TanggalProduksi = TanggalProduksi;
    item.TanggalSelesai = TanggalSelesai;
    item.NamaProduk = NamaProduk;
    item.Batch = Batch;
    item.Satuan = Satuan;
    item.JumlahProduksi = JumlahProduksi;
    item.StatusProduksi = StatusProduksi;

    await item.save();

    res.status(200).json({
      message: "StatusProduksi berhasil diperbarui",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal memperbarui StatusProduksi",
      error: error.message,
    });
  }
};

// Hapus data StatusProduksi berdasarkan id
exports.deleteStatusProduksi = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await StatusProduksiModel.findByPk(id);

    if (!item) {
      return res
        .status(404)
        .json({ message: "Data StatusProduksi tidak ditemukan" });
    }

    await item.destroy();

    res.status(200).json({
      message: "StatusProduksi berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus StatusProduksi",
      error: error.message,
    });
  }
};
