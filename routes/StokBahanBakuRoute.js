const express = require("express");
const {
  updateStokBahanBaku,
  getAllStokBahanBaku,
} = require("../controllers/StokBahanBaku");

const router = express.Router();

router.patch("/stokbahanbaku/:id", updateStokBahanBaku);
router.get("/stokbahanbaku", getAllStokBahanBaku);

module.exports = router;
