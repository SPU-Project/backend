// C:\Hasan\SV IPB\Semester 7\Backend\routes\PenjualanProduk.js

const express = require("express");
const router = express.Router();

// Import controller
const {
  getAllPenjualanProduk,
  getPenjualanProdukById,
  createPenjualanProduk,
  updatePenjualanProduk,
  deletePenjualanProduk,
} = require("../controllers/PenjualanProduk.js");

// GET all PenjualanProduk
//    URL: GET /penjualan-produk
router.get("/PenjualanProduk", getAllPenjualanProduk);

// GET by id PenjualanProduk
//    URL: GET /penjualan-produk/:id
router.get("/PenjualanProduk/:id", getPenjualanProdukById);

// CREATE PenjualanProduk
//    URL: POST /penjualan-produk
router.post("/PenjualanProduk", createPenjualanProduk);

// UPDATE PenjualanProduk
//    URL: PATCH /penjualan-produk/:id
router.patch("/PenjualanProduk/:id", updatePenjualanProduk);

// DELETE PenjualanProduk
//    URL: DELETE /penjualan-produk/:id
router.delete("/PenjualanProduk/:id", deletePenjualanProduk);

module.exports = router;
