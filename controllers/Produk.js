// controllers/Produk.js

const ProdukModel = require("../models/ProdukModel.js");
const BahanBakuModel = require("../models/BahanBakuModel.js");
const OverheadModel = require("../models/OverheadModel.js");
const KemasanModel = require("../models/KemasanModel.js");
const ProdukBahanBakuModel = require("../models/ProdukBahanBakuModel.js");

const addProduk = async (req, res) => {
  try {
    const { namaProduk, bahanBaku, overhead, kemasan } = req.body;

    // Hitung total biaya bahan baku
    let totalBahanBaku = 0;
    for (let item of bahanBaku) {
      const bahan = await BahanBakuModel.findOne({ where: { id: item.id } });

      if (!bahan) {
        return res.status(404).json({
          message: `Bahan Baku dengan id ${item.id} tidak ditemukan`,
        });
      }

      // Pastikan harga per gram dihitung dengan benar
      const hargaPerGram = bahan.Harga / 1000; // Mengambil harga per gram dari harga per kilogram
      totalBahanBaku += hargaPerGram * item.jumlah;
    }

    // Hitung total overhead
    let totalOverhead = overhead.reduce((acc, curr) => acc + curr.harga, 0);

    // Hitung total kemasan
    let totalKemasan = kemasan.reduce((acc, curr) => acc + curr.harga, 0);

    // Hitung HPP
    const hpp = totalBahanBaku + totalOverhead + totalKemasan;

    // Simpan produk baru
    const produkBaru = await ProdukModel.create({
      namaProduk: namaProduk,
      hpp: hpp,
      margin20: Math.round(hpp * 1.2),
      margin30: Math.round(hpp * 1.3),
      margin40: Math.round(hpp * 1.4),
      margin50: Math.round(hpp * 1.5),
      margin60: Math.round(hpp * 1.6),
      margin70: Math.round(hpp * 1.7),
      margin80: Math.round(hpp * 1.8),
      margin90: Math.round(hpp * 1.9),
      margin100: Math.round(hpp * 2.0),
    });

    // Simpan data bahan baku
    for (let item of bahanBaku) {
      await ProdukBahanBakuModel.create({
        produkId: produkBaru.id,
        bahanBakuId: item.id,
        jumlah: item.jumlah,
      });
    }

    // Simpan overhead
    for (let item of overhead) {
      await OverheadModel.create({
        namaOverhead: item.namaOverhead,
        harga: item.harga,
        produkId: produkBaru.id,
      });
    }

    // Simpan kemasan
    for (let item of kemasan) {
      await KemasanModel.create({
        namaKemasan: item.namaKemasan,
        harga: item.harga,
        produkId: produkBaru.id,
      });
    }

    res.status(201).json({
      message: "Produk Berhasil Ditambahkan",
      data: produkBaru,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal Menambahkan Produk",
      error: error.message,
    });
  }
};

const updateProduk = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaProduk, bahanBaku, overhead, kemasan } = req.body;

    const produk = await ProdukModel.findByPk(id);
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    if (namaProduk) {
      produk.namaProduk = namaProduk;
    }

    let totalBahanBaku = 0;
    if (bahanBaku && bahanBaku.length > 0) {
      await ProdukBahanBakuModel.destroy({ where: { produkId: id } });

      for (let item of bahanBaku) {
        const bahan = await BahanBakuModel.findOne({ where: { id: item.id } });
        if (!bahan) {
          return res.status(404).json({
            message: `Bahan Baku dengan id ${item.id} tidak ditemukan`,
          });
        }

        const hargaPerGram = Math.round(bahan.Harga / 1000); // Bulatkan ke integer
        totalBahanBaku += hargaPerGram * item.jumlah;

        await ProdukBahanBakuModel.create({
          produkId: produk.id,
          bahanBakuId: item.id,
          jumlah: Math.round(item.jumlah), // Pastikan jumlah juga integer
        });
      }
    }
    totalBahanBaku = Math.round(totalBahanBaku); // Bulatkan hasil akhir

    let totalOverhead = 0;
    if (overhead && overhead.length > 0) {
      await OverheadModel.destroy({ where: { produkId: id } });

      for (let item of overhead) {
        const harga = Math.round(Number(item.harga));
        totalOverhead += harga;

        await OverheadModel.create({
          namaOverhead: item.namaOverhead,
          harga: harga,
          produkId: produk.id,
        });
      }
    }

    let totalKemasan = 0;
    if (kemasan && kemasan.length > 0) {
      await KemasanModel.destroy({ where: { produkId: id } });

      for (let item of kemasan) {
        const harga = Math.round(Number(item.harga));
        totalKemasan += harga;

        await KemasanModel.create({
          namaKemasan: item.namaKemasan,
          harga: harga,
          produkId: produk.id,
        });
      }
    }

    const hpp = Math.round(totalBahanBaku + totalOverhead + totalKemasan);

    produk.hpp = hpp;
    produk.margin20 = Math.round(hpp * 1.2);
    produk.margin30 = Math.round(hpp * 1.3);
    produk.margin40 = Math.round(hpp * 1.4);
    produk.margin50 = Math.round(hpp * 1.5);
    produk.margin60 = Math.round(hpp * 1.6);
    produk.margin70 = Math.round(hpp * 1.7);
    produk.margin80 = Math.round(hpp * 1.8);
    produk.margin90 = Math.round(hpp * 1.9);
    produk.margin100 = Math.round(hpp * 2.0);

    await produk.save();

    res.status(200).json({
      message: "Produk Berhasil Diperbarui",
      data: produk,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal Memperbarui Produk",
      error: error.message,
    });
  }
};

const getAllProdukBahanBaku = async (req, res) => {
  try {
    const produkBahanBaku = await ProdukBahanBakuModel.findAll({
      include: [
        {
          model: BahanBakuModel,
          as: "bahanBaku",
          attributes: ["id", "BahanBaku", "Harga"],
        },
        {
          model: ProdukModel,
          as: "produk",
          attributes: [
            "id",
            "namaProduk",
            "hpp",
            "margin20",
            "margin30",
            "margin40",
            "margin50",
            "margin60",
            "margin70",
            "margin80",
            "margin90",
            "margin100",
          ],
          include: [
            {
              model: KemasanModel,
              attributes: ["id", "namaKemasan", "harga"],
            },
            {
              model: OverheadModel,
              attributes: ["id", "namaOverhead", "harga"],
            },
          ],
        },
      ],
    });
    res.status(200).json({
      message: "Data Produk Bahan Baku berhasil diambil",
      data: produkBahanBaku,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data Produk Bahan Baku",
      error: error.message,
    });
  }
};

const getProdukBahanBakuByProdukId = async (req, res) => {
  try {
    const { produkId } = req.params;
    const produkBahanBaku = await ProdukBahanBakuModel.findAll({
      where: { produkId },
      include: [
        {
          model: BahanBakuModel,
          as: "bahanBaku",
          attributes: ["id", "BahanBaku", "Harga"],
        },
        {
          model: ProdukModel,
          as: "produk",
          attributes: [
            "id",
            "namaProduk",
            "hpp",
            "margin20",
            "margin30",
            "margin40",
            "margin50",
            "margin60",
            "margin70",
            "margin80",
            "margin90",
            "margin100",
          ],
          include: [
            {
              model: KemasanModel,
              attributes: ["id", "namaKemasan", "harga"],
            },
            {
              model: OverheadModel,
              attributes: ["id", "namaOverhead", "harga"],
            },
          ],
        },
      ],
    });
    if (!produkBahanBaku.length) {
      return res.status(404).json({
        message: "Tidak ada data ditemukan untuk produk ini",
        data: [],
      });
    }
    res.status(200).json({
      message: "Data Produk Bahan Baku berhasil diambil",
      data: produkBahanBaku,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data Produk Bahan Baku",
      error: error.message,
    });
  }
};

// Update Produk Details

/* export const updateProdukDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaProduk, bahanBaku, overhead, kemasan } = req.body;

    const produk = await ProdukModel.findByPk(id);
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    if (namaProduk) {
      produk.namaProduk = namaProduk;
    }

    let totalBahanBaku = 0;
    if (bahanBaku && bahanBaku.length > 0) {
      await ProdukBahanBakuModel.destroy({ where: { produkId: id } });

      for (let item of bahanBaku) {
        const bahan = await BahanBakuModel.findOne({ where: { id: item.id } });
        if (!bahan) {
          return res.status(404).json({
            message: `Bahan Baku dengan id ${item.id} tidak ditemukan`,
          });
        }

        const hargaPerGram = Math.round(bahan.Harga / 1000); // Bulatkan ke integer
        totalBahanBaku += hargaPerGram * item.jumlah;

        await ProdukBahanBakuModel.create({
          produkId: produk.id,
          bahanBakuId: item.id,
          jumlah: Math.round(item.jumlah), // Pastikan jumlah juga integer
        });
      }
    }
    totalBahanBaku = Math.round(totalBahanBaku); // Bulatkan hasil akhir

    let totalOverhead = 0;
    if (overhead && overhead.length > 0) {
      await OverheadModel.destroy({ where: { produkId: id } });

      for (let item of overhead) {
        const harga = Math.round(Number(item.harga));
        totalOverhead += harga;

        await OverheadModel.create({
          namaOverhead: item.namaOverhead,
          harga: harga,
          produkId: produk.id,
        });
      }
    }

    let totalKemasan = 0;
    if (kemasan && kemasan.length > 0) {
      await KemasanModel.destroy({ where: { produkId: id } });

      for (let item of kemasan) {
        const harga = Math.round(Number(item.harga));
        totalKemasan += harga;

        await KemasanModel.create({
          namaKemasan: item.namaKemasan,
          harga: harga,
          produkId: produk.id,
        });
      }
    }

    const hpp = Math.round(totalBahanBaku + totalOverhead + totalKemasan);

    produk.hpp = hpp;
    produk.margin20 = Math.round(hpp * 1.2);
    produk.margin30 = Math.round(hpp * 1.3);
    produk.margin40 = Math.round(hpp * 1.4);
    produk.margin50 = Math.round(hpp * 1.5);
    produk.margin60 = Math.round(hpp * 1.6);
    produk.margin70 = Math.round(hpp * 1.7);
    produk.margin80 = Math.round(hpp * 1.8);
    produk.margin90 = Math.round(hpp * 1.9);
    produk.margin100 = Math.round(hpp * 2.0);

    await produk.save();

    res.status(200).json({
      message: "Produk Berhasil Diperbarui",
      data: produk,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal Memperbarui Produk",
      error: error.message,
    });
  }
}; */

const deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari produk berdasarkan ID
    const produk = await ProdukModel.findByPk(id);

    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Mulai transaksi untuk memastikan konsistensi data
    await ProdukModel.sequelize.transaction(async (t) => {
      // Hapus data terkait di ProdukBahanBakuModel
      await ProdukBahanBakuModel.destroy({
        where: { produkId: id },
        transaction: t,
      });

      // Hapus data terkait di OverheadModel
      await OverheadModel.destroy({
        where: { produkId: id },
        transaction: t,
      });

      // Hapus data terkait di KemasanModel
      await KemasanModel.destroy({
        where: { produkId: id },
        transaction: t,
      });

      // Hapus produk
      await produk.destroy({ transaction: t });
    });

    res
      .status(200)
      .json({ message: "Produk dan data terkait berhasil dihapus" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Gagal menghapus produk", error: error.message });
  }
};

module.exports = {
  addProduk,
  updateProduk,
  getAllProdukBahanBaku,
  getProdukBahanBakuByProdukId,
  deleteProduk,
};
