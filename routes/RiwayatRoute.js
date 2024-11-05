// routes/RiwayatRoute.js

const express = require("express");
const { getAllRiwayat } = require("../controllers/Riwayat.js");

const router = express.Router();

// Mendefinisikan route untuk mendapatkan semua data Riwayat Log
router.get("/riwayat", getAllRiwayat);

module.exports = router;
