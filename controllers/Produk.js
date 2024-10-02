// controllers/Produk.js

import ProdukModel from "../models/ProdukModel.js";
import BahanBakuModel from "../models/BahanBakuModel.js";
import OverheadModel from "../models/OverheadModel.js";
import KemasanModel from "../models/KemasanModel.js";
import ProdukBahanBakuModel from "../models/ProdukBahanBakuModel.js";

export const addProduk = async (req, res) => {
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

/* export const updateProduk = async (req, res) => {
    try {
        const { id } = req.params;
        const { namaProduk, bahanBaku, overhead, kemasan } = req.body;

        // Temukan produk yang akan diupdate
        const produk = await ProdukModel.findByPk(id);
        if (!produk) {
            return res.status(404).json({ message: "Produk tidak ditemukan" });
        }

        // Hitung ulang total biaya bahan baku
        let totalBahanBaku = 0;
        for (let item of bahanBaku) {
            const bahan = await BahanBakuModel.findOne({ where: { id: item.id } });
            totalBahanBaku += (bahan.Harga * item.jumlah);
        }

        // Hitung ulang total overhead
        let totalOverhead = overhead.reduce((acc, curr) => acc + curr.harga, 0);

        // Hitung ulang total kemasan
        let totalKemasan = kemasan.reduce((acc, curr) => acc + curr.harga, 0);

        // Hitung ulang HPP
        const hpp = totalBahanBaku + totalOverhead + totalKemasan;

        // Update produk
        produk.namaProduk = namaProduk;
        produk.hpp = hpp;
        produk.margin20 = Math.round(hpp * 1.2);
        produk.margin40 = Math.round(hpp * 1.4);
        produk.margin60 = Math.round(hpp * 1.6);
        produk.margin80 = Math.round(hpp * 1.8);
        await produk.save();

        // Update data bahan baku
        await ProdukBahanBakuModel.destroy({ where: { produkId: id } }); // Hapus bahan baku lama
        for (let item of bahanBaku) {
            await ProdukBahanBakuModel.create({
                produkId: produk.id,
                bahanBakuId: item.id,
                jumlah: item.jumlah
            });
        }

        // Update overhead
        await OverheadModel.destroy({ where: { produkId: id } }); // Hapus overhead lama
        for (let item of overhead) {
            await OverheadModel.create({
                namaOverhead: item.namaOverhead,
                harga: item.harga,
                produkId: produk.id
            });
        }

        // Update kemasan
        await KemasanModel.destroy({ where: { produkId: id } }); // Hapus kemasan lama
        for (let item of kemasan) {
            await KemasanModel.create({
                namaKemasan: item.namaKemasan,
                harga: item.harga,
                produkId: produk.id
            });
        }

        res.status(200).json({
            message: "Produk Berhasil Diupdate",
            data: produk
        });
    } catch (error) {
        res.status(400).json({
            message: "Gagal Mengupdate Produk",
            error: error.message
        });
    }
}; */

// controllers/Produk.js

export const getAllProdukBahanBaku = async (req, res) => {
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
export const getProdukBahanBakuByProdukId = async (req, res) => {
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

export const updateProdukDetails = async (req, res) => {
  try {
    const { id } = req.params; // Mengambil ID produk dari parameter URL
    const { namaProduk, bahanBaku, overhead, kemasan } = req.body;

    // Temukan produk yang akan diperbarui
    const produk = await ProdukModel.findByPk(id);
    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Update nama produk jika ada
    if (namaProduk) {
      produk.namaProduk = namaProduk;
    }

    // Hitung total biaya bahan baku
    let totalBahanBaku = 0;
    if (bahanBaku && bahanBaku.length > 0) {
      // Hapus bahan baku lama yang terkait dengan produk
      await ProdukBahanBakuModel.destroy({ where: { produkId: id } });

      // Tambahkan bahan baku baru
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

        // Simpan data bahan baku baru
        await ProdukBahanBakuModel.create({
          produkId: produk.id,
          bahanBakuId: item.id,
          jumlah: item.jumlah,
        });
      }
    }

    // Hitung total overhead
    let totalOverhead = 0;
    if (overhead && overhead.length > 0) {
      // Hapus overhead lama yang terkait dengan produk
      await OverheadModel.destroy({ where: { produkId: id } });

      // Tambahkan overhead baru
      for (let item of overhead) {
        totalOverhead += item.harga;

        // Simpan data overhead baru
        await OverheadModel.create({
          namaOverhead: item.namaOverhead,
          harga: item.harga,
          produkId: produk.id,
        });
      }
    }

    // Hitung total kemasan
    let totalKemasan = 0;
    if (kemasan && kemasan.length > 0) {
      // Hapus kemasan lama yang terkait dengan produk
      await KemasanModel.destroy({ where: { produkId: id } });

      // Tambahkan kemasan baru
      for (let item of kemasan) {
        totalKemasan += item.harga;

        // Simpan data kemasan baru
        await KemasanModel.create({
          namaKemasan: item.namaKemasan,
          harga: item.harga,
          produkId: produk.id,
        });
      }
    }

    // Hitung HPP baru
    const hpp = totalBahanBaku + totalOverhead + totalKemasan;

    // Update produk dengan HPP dan margin yang baru
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

export const deleteProduk = async (req, res) => {
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
