// routes/ProdukRoute.js

import express from 'express';
import {addProduk,
        getAllProdukBahanBaku, 
        getProdukBahanBakuByProdukId,
        deleteProdukBahanBaku,
        updateProdukDetails
 } from "../controllers/Produk.js";

const router = express.Router();

// Add ProdukBahanBaku 
router.post('/produk', addProduk);

// Get all ProdukBahanBaku entries
router.get('/produkbahanbaku', getAllProdukBahanBaku);

// Get ProdukBahanBaku by Produk ID
router.get('/produkbahanbaku/:produkId', getProdukBahanBakuByProdukId);

// Update ProdukBahanBaku entry by ID
router.patch('/produkbahanbakudetails/:id', updateProdukDetails);

// Delete ProdukBahanBaku entry by ID
router.delete('/produkbahanbaku/:id', deleteProdukBahanBaku);

export default router;
