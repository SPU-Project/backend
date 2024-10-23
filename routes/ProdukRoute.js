const express = require("express");
const {
  addProduk,
  getAllProdukBahanBaku,
  getProdukBahanBakuByProdukId,
  // updateProdukDetails, // Jika perlu, bisa di-uncomment
  updateProduk,
  deleteProduk,
} = require("../controllers/Produk.js");

const router = express.Router();

// Add ProdukBahanBaku
router.post("/produk", addProduk);

// Get all ProdukBahanBaku entries
router.get("/produkdetails", getAllProdukBahanBaku);

// Get ProdukBahanBaku by Produk ID
router.get("/produkdetails/:produkId", getProdukBahanBakuByProdukId);

// Update ProdukBahanBaku entry by ID V2
router.patch("/produkbahanbaku/:id", updateProduk);

// Delete ProdukBahanBaku entry by ID
router.delete("/produkdelete/:id", deleteProduk);

module.exports = router;
