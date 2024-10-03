// routes/ProdukRoute.js

import express from "express";
import {
  addProduk,
  getAllProdukBahanBaku,
  getProdukBahanBakuByProdukId,
  /* updateProdukDetails, */
  updateProduk,
  deleteProduk,
} from "../controllers/Produk.js";

const router = express.Router();

// Add ProdukBahanBaku
router.post("/produk", addProduk);

// Get all ProdukBahanBaku entries
router.get("/produkdetails", getAllProdukBahanBaku);

// Get ProdukBahanBaku by Produk ID
router.get("/produkdetails/:produkId", getProdukBahanBakuByProdukId);

/* // Update ProdukBahanBaku entry by ID
router.patch("/produkbahanbakudetails/:id", updateProdukDetails); */

// Update ProdukBahanBaku entry by ID V2
router.patch("/produkbahanbaku/:id", updateProduk);

// Delete ProdukBahanBaku entry by ID
router.delete("/produkdelete/:id", deleteProduk);

export default router;
