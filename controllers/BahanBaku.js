import BahanBakuModel from "../models/BahanBakuModel.js";

// Function to add new Bahan Baku
//Create 
export const addBahanBaku = async (req, res) => {
    try {
        const { BahanBaku, Harga } = req.body;

        // Create a new record in the BahanBakuModel
        const newBahanBaku = await BahanBakuModel.create({
            BahanBaku,
            Harga
        });

        res.status(201).json({
            message: "Bahan Baku Berhasil Ditambahkan",
            data: newBahanBaku
        });
    } catch (error) {
        res.status(400).json({
            message: "Gagal Menambahkan Bahan Baku",
            error: error.message
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

        // Find the BahanBaku record by id
        const bahanBaku = await BahanBakuModel.findByPk(id);
        if (!bahanBaku) {
            return res.status(404).json({
                message: "Bahan Baku tidak ditemukan"
            });
        }

        // Update the BahanBaku record with the new data
        bahanBaku.BahanBaku = BahanBaku;
        bahanBaku.Harga = Harga;

        await bahanBaku.save();

        res.status(200).json({
            message: "Bahan Baku Berhasil Diupdate",
            data: bahanBaku
        });
    } catch (error) {
        res.status(400).json({
            message: "Gagal Mengupdate Bahan Baku",
            error: error.message
        });
    }
};

//Delete

// Function to delete a Bahan Baku by id
export const deleteBahanBaku = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the BahanBaku record by id
        const bahanBaku = await BahanBakuModel.findByPk(id);
        if (!bahanBaku) {
            return res.status(404).json({
                message: "Bahan Baku tidak ditemukan"
            });
        }

        // Delete the BahanBaku record
        await bahanBaku.destroy();

        res.status(200).json({
            message: "Bahan Baku Berhasil Dihapus"
        });
    } catch (error) {
        res.status(400).json({
            message: "Gagal Menghapus Bahan Baku",
            error: error.message
        });
    }
};