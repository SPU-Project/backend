// controllers/Produk.js

const ProdukModel = require("../models/ProdukModel.js");
const BahanBakuModel = require("../models/BahanBakuModel.js");
const OverheadModel = require("../models/OverheadModel.js");
const KemasanModel = require("../models/KemasanModel.js");
const ProdukBahanBakuModel = require("../models/ProdukBahanBakuModel.js");
const RiwayatLog = require("../models/RiwayatLog.js");
const Admin = require("../models/AdminModel.js");
const getNextBatchNumber = require("../utils/getNextBatchNumber.js");

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

const addProduk = async (req, res) => {
  try {
    const { namaProduk, bahanBaku, overhead, kemasan } = req.body;

    // Step 1: Aggregate bahanBaku items by id
    let bahanBakuMap = {};
    for (let item of bahanBaku) {
      if (bahanBakuMap[item.id]) {
        // Sum the jumlah for the same bahanBakuId
        bahanBakuMap[item.id] += item.jumlah;
      } else {
        bahanBakuMap[item.id] = item.jumlah;
      }
    }

    // Convert the map to an array
    let aggregatedBahanBaku = [];
    for (let id in bahanBakuMap) {
      aggregatedBahanBaku.push({ id: parseInt(id), jumlah: bahanBakuMap[id] });
    }

    // Step 2: Calculate total bahan baku cost
    let totalBahanBaku = 0;
    for (let item of aggregatedBahanBaku) {
      const bahan = await BahanBakuModel.findOne({ where: { id: item.id } });

      if (!bahan) {
        return res.status(404).json({
          message: `Bahan Baku dengan id ${item.id} tidak ditemukan`,
        });
      }

      // Calculate cost per gram (atau per satuan)
      // di sini Anda sudah menyesuaikan => "const hargaPerGram = bahan.Harga;"
      const hargaPerGram = bahan.Harga;
      totalBahanBaku += hargaPerGram * item.jumlah;
    }

    // Step 3: Calculate overhead and kemasan costs
    let totalOverhead = overhead.reduce((acc, curr) => acc + curr.harga, 0);
    let totalKemasan = kemasan.reduce((acc, curr) => acc + curr.harga, 0);

    // Step 4: Calculate HPP
    const hpp = totalBahanBaku + totalOverhead + totalKemasan;

    // ===== Generate KodeProduksi (tanpa random, pakai batch DB) =====
    let prefix = namaProduk.replace(/\s+/g, "").substring(0, 3).toUpperCase();

    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2); // "25"
    const mm = String(now.getMonth() + 1).padStart(2, "0"); // "03"

    const batch = await getNextBatchNumber(prefix, yy, mm);
    // misal batch=1 jika belum ada product di 'GAR2503%'

    // Bentuk kodenya => "GAR2503-1" (atau format lain, misal padStart 3 digit => "GAR2503-001")
    const kodeProduksi = `${prefix}${yy}${mm}-${batch}`;
    // ===== /Generate KodeProduksi =====

    // Step 5: Save the new product
    const produkBaru = await ProdukModel.create({
      // kolom baru
      KodeProduksi: kodeProduksi,

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

    // Step 6: Save aggregated bahan baku data
    for (let item of aggregatedBahanBaku) {
      await ProdukBahanBakuModel.create({
        produkId: produkBaru.id,
        bahanBakuId: item.id,
        jumlah: item.jumlah,
      });
    }

    // Step 7: Save overhead
    for (let item of overhead) {
      await OverheadModel.create({
        namaOverhead: item.namaOverhead,
        harga: item.harga,
        produkId: produkBaru.id,
      });
    }

    // Step 8: Save kemasan
    for (let item of kemasan) {
      await KemasanModel.create({
        namaKemasan: item.namaKemasan,
        harga: item.harga,
        produkId: produkBaru.id,
      });
    }

    // Bagian RiwayatLog
    const user = await getUserInfo(req);
    if (user) {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: `Menambahkan Produk: ${produkBaru.namaProduk}`,
      });
    }

    res.status(201).json({
      message: "Produk berhasil ditambahkan",
      data: produkBaru,
    });
  } catch (error) {
    console.error("Error adding product:", error.message);
    res.status(500).json({
      message: "Terjadi kesalahan saat menambahkan produk",
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

    // Simpan nama produk lama untuk log
    const oldNamaProduk = produk.namaProduk;

    if (namaProduk) {
      produk.namaProduk = namaProduk;
    }

    // Handle bahanBaku updates
    if (bahanBaku && bahanBaku.length > 0) {
      // Aggregate bahanBaku items by id
      let bahanBakuMap = {};

      for (let item of bahanBaku) {
        if (bahanBakuMap[item.id]) {
          bahanBakuMap[item.id] += item.jumlah;
        } else {
          bahanBakuMap[item.id] = item.jumlah;
        }
      }

      // Convert the map to an array
      let aggregatedBahanBaku = [];
      for (let id in bahanBakuMap) {
        aggregatedBahanBaku.push({
          id: parseInt(id),
          jumlah: bahanBakuMap[id],
        });
      }

      // Recalculate totalBahanBaku
      let totalBahanBaku = 0;

      // Delete old associations
      await ProdukBahanBakuModel.destroy({ where: { produkId: id } });

      for (let item of aggregatedBahanBaku) {
        const bahan = await BahanBakuModel.findOne({ where: { id: item.id } });
        if (!bahan) {
          return res.status(404).json({
            message: `Bahan Baku dengan id ${item.id} tidak ditemukan`,
          });
        }

        const hargaPerGram = bahan.Harga;
        totalBahanBaku += hargaPerGram * item.jumlah;

        await ProdukBahanBakuModel.create({
          produkId: produk.id,
          bahanBakuId: item.id,
          jumlah: item.jumlah,
        });
      }

      produk.hpp = totalBahanBaku; // Update HPP with new totalBahanBaku
    }

    // Handle overhead updates
    if (overhead && overhead.length > 0) {
      await OverheadModel.destroy({ where: { produkId: id } });

      let totalOverhead = 0;
      for (let item of overhead) {
        totalOverhead += item.harga;

        await OverheadModel.create({
          namaOverhead: item.namaOverhead,
          harga: item.harga,
          produkId: produk.id,
        });
      }

      produk.hpp += totalOverhead; // Update HPP with new overhead
    }

    // Handle kemasan updates
    if (kemasan && kemasan.length > 0) {
      await KemasanModel.destroy({ where: { produkId: id } });

      let totalKemasan = 0;
      for (let item of kemasan) {
        totalKemasan += item.harga;

        await KemasanModel.create({
          namaKemasan: item.namaKemasan,
          harga: item.harga,
          produkId: produk.id,
        });
      }

      produk.hpp += totalKemasan; // Update HPP with new kemasan
    }

    // Recalculate margins
    produk.margin20 = Math.round(produk.hpp * 1.2);
    produk.margin30 = Math.round(produk.hpp * 1.3);
    produk.margin40 = Math.round(produk.hpp * 1.4);
    produk.margin50 = Math.round(produk.hpp * 1.5);
    produk.margin60 = Math.round(produk.hpp * 1.6);
    produk.margin70 = Math.round(produk.hpp * 1.7);
    produk.margin80 = Math.round(produk.hpp * 1.8);
    produk.margin90 = Math.round(produk.hpp * 1.9);
    produk.margin100 = Math.round(produk.hpp * 2.0);

    await produk.save();

    // Dapatkan informasi pengguna
    const user = await getUserInfo(req);

    // Simpan log ke RiwayatLog
    if (user) {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: `Mengupdate Produk dari ${oldNamaProduk} ke ${produk.namaProduk}`,
      });
    }

    // Fetch updated product with associations
    const updatedProduk = await ProdukModel.findOne({
      where: { id: produk.id },
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
          model: BahanBakuModel,
          as: "bahanbakumodel",
          attributes: ["id", "BahanBaku", "Harga"],
          through: { attributes: ["jumlah"] },
        },
        {
          model: KemasanModel,
          as: "kemasans",
          attributes: ["id", "namaKemasan", "harga"],
        },
        {
          model: OverheadModel,
          as: "overheads",
          attributes: ["id", "namaOverhead", "harga"],
        },
      ],
    });

    let bahanbakumodel = [];
    if (
      updatedProduk.bahanbakumodel &&
      updatedProduk.bahanbakumodel.length > 0
    ) {
      bahanbakumodel = updatedProduk.bahanbakumodel.map((bahanBaku) => {
        const jumlah = bahanBaku.ProdukBahanBakuModel
          ? bahanBaku.ProdukBahanBakuModel.jumlah
          : null;

        return {
          ...bahanBaku.toJSON(),
          jumlah: jumlah,
          ProdukBahanBakuModel: undefined, // Remove the nested object
        };
      });
    }

    const responseData = {
      ...updatedProduk.toJSON(),
      bahanbakumodel,
    };

    res.status(200).json({
      message: "Produk Berhasil Diperbarui",
      data: responseData,
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
    const produkList = await ProdukModel.findAll({
      attributes: [
        "id",
        "KodeProduksi",
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
          model: BahanBakuModel,
          as: "bahanbakumodel",
          attributes: ["id", "BahanBaku", "Harga"],
          through: {
            model: ProdukBahanBakuModel,
            attributes: ["jumlah"],
          },
        },
        {
          model: KemasanModel,
          as: "kemasans",
          attributes: ["id", "namaKemasan", "harga"],
        },
        {
          model: OverheadModel,
          as: "overheads",
          attributes: ["id", "namaOverhead", "harga"],
        },
      ],
    });

    // Adjust the data for each product
    const adjustedProdukList = produkList.map((produk) => {
      console.log("Raw kodeProduksi:", produk.KodeProduksi);
      console.log("Array of chars:", [...produk.KodeProduksi]);
      console.log(
        "Char codes:",
        [...produk.KodeProduksi].map((c) => c.charCodeAt(0))
      );
      // --- 1) Buat batch dari kodeProduksi ---
      let batchValue = "";
      if (produk.KodeProduksi) {
        const splitted = produk.KodeProduksi.split("-");
        if (splitted.length > 1) {
          batchValue = splitted[1]; // Bagian setelah "-"
        }
      }

      // --- 2) Adjust bahanbakumodel data ---
      let bahanbakumodel = [];
      if (produk.bahanbakumodel && produk.bahanbakumodel.length > 0) {
        bahanbakumodel = produk.bahanbakumodel.map((bahanBaku) => {
          const jumlah = bahanBaku.ProdukBahanBakuModel
            ? bahanBaku.ProdukBahanBakuModel.jumlah
            : null;

          return {
            ...bahanBaku.toJSON(),
            jumlah: jumlah,
            ProdukBahanBakuModel: undefined, // Remove the nested object
          };
        });
      }

      // --- 3) Adjust kemasans ---
      let kemasans = [];
      if (produk.kemasans && produk.kemasans.length > 0) {
        kemasans = produk.kemasans.map((kemasan) => {
          let hargaValue = kemasan.harga;
          if (typeof hargaValue === "string") {
            hargaValue = Number(hargaValue.replace(/\./g, ""));
          }
          const formattedHarga = hargaValue.toLocaleString("id-ID");
          return {
            ...kemasan.toJSON(),
            harga: formattedHarga,
          };
        });
      }

      // --- 4) Adjust overheads ---
      let overheads = [];
      if (produk.overheads && produk.overheads.length > 0) {
        overheads = produk.overheads.map((overhead) => {
          let hargaValue = overhead.harga;
          if (typeof hargaValue === "string") {
            hargaValue = Number(hargaValue.replace(/\./g, ""));
          }
          const formattedHarga = hargaValue.toLocaleString("id-ID");
          return {
            ...overhead.toJSON(),
            harga: formattedHarga,
          };
        });
      }

      return {
        ...produk.toJSON(),
        batch: batchValue, // Tambahkan atribut batch
        bahanbakumodel,
        kemasans,
        overheads,
      };
    });

    res.status(200).json({
      message: "Data Produk berhasil diambil",
      data: adjustedProdukList,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data Produk",
      error: error.message,
    });
  }
};

const getProdukBahanBakuByProdukId = async (req, res) => {
  try {
    const { produkId } = req.params;

    const produk = await ProdukModel.findOne({
      where: { id: produkId },
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
          model: BahanBakuModel,
          as: "bahanbakumodel",
          attributes: ["id", "BahanBaku", "Harga"],
          through: {
            model: ProdukBahanBakuModel,
            attributes: ["jumlah"],
          },
        },
        {
          model: KemasanModel,
          as: "kemasans",
          attributes: ["id", "namaKemasan", "harga"],
        },
        {
          model: OverheadModel,
          as: "overheads",
          attributes: ["id", "namaOverhead", "harga"],
        },
      ],
    });

    if (!produk) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
        data: null,
      });
    }

    // Adjust the bahanbakumodel data
    let bahanbakumodel = [];
    if (produk.bahanbakumodel && produk.bahanbakumodel.length > 0) {
      bahanbakumodel = produk.bahanbakumodel.map((bahanBaku) => {
        const jumlah = bahanBaku.ProdukBahanBakuModel
          ? bahanBaku.ProdukBahanBakuModel.jumlah
          : null;

        return {
          ...bahanBaku.toJSON(),
          jumlah: jumlah,
          ProdukBahanBakuModel: undefined, // Remove the nested object
        };
      });
    }

    const responseData = {
      ...produk.toJSON(),
      bahanbakumodel,
    };

    res.status(200).json({
      message: "Data Produk berhasil diambil",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil data Produk",
      error: error.message,
    });
  }
};

const deleteProduk = async (req, res) => {
  try {
    const { id } = req.params;

    // Cari produk berdasarkan ID
    const produk = await ProdukModel.findByPk(id);

    if (!produk) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // Simpan nama produk untuk log
    const namaProduk = produk.namaProduk;

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

    // Dapatkan informasi pengguna
    const user = await getUserInfo(req);

    // Simpan log ke RiwayatLog
    if (user) {
      await RiwayatLog.create({
        username: user.username,
        role: user.role,
        description: `Menghapus Produk: ${namaProduk}`,
      });
    }

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
