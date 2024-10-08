import BahanBakuModel from "../models/BahanBakuModel.js";
import ProdukBahanBakuModel from "../models/ProdukBahanBakuModel.js";

// Function to add new Bahan Baku
//Create
export const addBahanBaku = async (req, res) => {
  try {
    const { BahanBaku, Harga } = req.body;

    // Create a new record in the BahanBakuModel
    const newBahanBaku = await BahanBakuModel.create({
      BahanBaku,
      Harga,
    });

    res.status(201).json({
      message: "Bahan Baku Berhasil Ditambahkan",
      data: newBahanBaku,
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal Menambahkan Bahan Baku",
      error: error.message,
    });
  }
};
//Read

//Update
// Function to update a Bahan Baku by id
export const updateBahanBaku = async (req, res) => {
  try {
    const { id } = req.params;
    const { BahanBaku, Harga } = req.body;

    const bahanBaku = await BahanBakuModel.findByPk(id);
    if (!bahanBaku) {
      return res.status(404).json({ message: "Bahan Baku tidak ditemukan" });
    }

    // Update fields
    bahanBaku.BahanBaku = BahanBaku;
    bahanBaku.Harga = Harga;

    await bahanBaku.save();

    // Return the updated data as JSON
    res.status(200).json({
      message: "Bahan Baku Berhasil Diupdate",
      data: bahanBaku,
    });
  } catch (error) {
    console.error("Error updating Bahan Baku:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//Delete

export const deleteBahanBaku = async (req, res) => {
  try {
    const { id } = req.params;
    // Find the BahanBaku record by id
    const bahanBaku = await BahanBakuModel.findByPk(id);
    if (!bahanBaku) {
      return res.status(404).json({
        message: "Bahan Baku tidak ditemukan",
      });
    }

    // Check if the Bahan Baku is used by any Produk
    const produkBahanBaku = await ProdukBahanBakuModel.findOne({
      where: {
        bahanBakuId: id,
      },
    });

    if (produkBahanBaku) {
      return res.status(400).json({
        message:
          "Bahan Baku tidak dapat dihapus karena sedang digunakan oleh Produk",
      });
    }

    // Delete the BahanBaku record
    await bahanBaku.destroy();
    res.status(200).json({
      message: "Bahan Baku Berhasil Dihapus",
    });
  } catch (error) {
    res.status(400).json({
      message: "Gagal Menghapus Bahan Baku",
      error: error.message,
    });
  }
};

// Function to get all Bahan Baku
export const getAllBahanBaku = async (req, res) => {
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
