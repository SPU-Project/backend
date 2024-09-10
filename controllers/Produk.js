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
                    message: `Bahan Baku dengan id ${item.id} tidak ditemukan`
                });
            }

            // Pastikan harga per gram dihitung dengan benar
            const hargaPerGram = bahan.Harga / 1000; // Mengambil harga per gram dari harga per kilogram
            totalBahanBaku += (hargaPerGram * item.jumlah);
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
            margin40: Math.round(hpp * 1.4),
            margin60: Math.round(hpp * 1.6),
            margin80: Math.round(hpp * 1.8)
        });

        // Simpan data bahan baku
        for (let item of bahanBaku) {
            await ProdukBahanBakuModel.create({
                produkId: produkBaru.id,
                bahanBakuId: item.id,
                jumlah: item.jumlah
            });
        }

        // Simpan overhead
        for (let item of overhead) {
            await OverheadModel.create({
                namaOverhead: item.namaOverhead,
                harga: item.harga,
                produkId: produkBaru.id
            });
        }

        // Simpan kemasan
        for (let item of kemasan) {
            await KemasanModel.create({
                namaKemasan: item.namaKemasan,
                harga: item.harga,
                produkId: produkBaru.id
            });
        }

        res.status(201).json({
            message: "Produk Berhasil Ditambahkan",
            data: produkBaru
        });
    } catch (error) {
        res.status(400).json({
            message: "Gagal Menambahkan Produk",
            error: error.message
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

// Get all ProdukBahanBaku entries
export const getAllProdukBahanBaku = async (req, res) => {
    try {
        const produkBahanBaku = await ProdukBahanBakuModel.findAll();
        res.status(200).json(produkBahanBaku);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
};

// Get ProdukBahanBaku by Produk ID
export const getProdukBahanBakuByProdukId = async (req, res) => {
    try {
        const { produkId } = req.params;
        const produkBahanBaku = await ProdukBahanBakuModel.findAll({ where: { produkId } });
        if (!produkBahanBaku.length) {
            return res.status(404).json({ message: "Tidak ada data ditemukan untuk produk ini" });
        }
        res.status(200).json(produkBahanBaku);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
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
                        message: `Bahan Baku dengan id ${item.id} tidak ditemukan`
                    });
                }

                // Pastikan harga per gram dihitung dengan benar
                const hargaPerGram = bahan.Harga / 1000; // Mengambil harga per gram dari harga per kilogram
                totalBahanBaku += (hargaPerGram * item.jumlah);

                // Simpan data bahan baku baru
                await ProdukBahanBakuModel.create({
                    produkId: produk.id,
                    bahanBakuId: item.id,
                    jumlah: item.jumlah
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
                    produkId: produk.id
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
                    produkId: produk.id
                });
            }
        }

        // Hitung HPP baru
        const hpp = totalBahanBaku + totalOverhead + totalKemasan;

        // Update produk dengan HPP dan margin yang baru
        produk.hpp = hpp;
        produk.margin20 = Math.round(hpp * 1.2);
        produk.margin40 = Math.round(hpp * 1.4);
        produk.margin60 = Math.round(hpp * 1.6);
        produk.margin80 = Math.round(hpp * 1.8);
        await produk.save();

        res.status(200).json({
            message: "Produk Berhasil Diperbarui",
            data: produk
        });
    } catch (error) {
        res.status(400).json({
            message: "Gagal Memperbarui Produk",
            error: error.message
        });
    }
};

// Delete ProdukBahanBaku entry
export const deleteProdukBahanBaku = async (req, res) => {
    try {
        const { id } = req.params;

        const produkBahanBaku = await ProdukBahanBakuModel.findByPk(id);
        if (!produkBahanBaku) {
            return res.status(404).json({ message: "Data tidak ditemukan" });
        }

        await produkBahanBaku.destroy();

        res.status(200).json({ message: "Data berhasil dihapus" });
    } catch (error) {
        res.status(400).json({ message: "Gagal menghapus data", error: error.message });
    }
};
