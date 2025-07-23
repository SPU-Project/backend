// C:\Hasan\SV IPB\Semester 7\Backend\routes\StatusProduk.js

const express = require("express");
const {
  getAllStatusProduksi,
  getStatusProduksiById,
  createStatusProduksi,
  updateStatusProduksi,
  deleteStatusProduksi,
} = require("../controllers/StatusProduk.js");

const router = express.Router();

// Rute untuk mengambil semua data StatusProduksi
router.get("/statusproduksi", getAllStatusProduksi);

// Rute untuk mengambil satu data StatusProduksi by id
router.get("/statusproduksi/:id", getStatusProduksiById);

// Rute untuk menambah data StatusProduksi
router.post("/statusproduksi", createStatusProduksi);

// Rute untuk meng-update data StatusProduksi
router.patch("/statusproduksi/:id", updateStatusProduksi);

// Rute untuk menghapus data StatusProduksi
router.delete("/statusproduksi/:id", deleteStatusProduksi);

module.exports = router;
