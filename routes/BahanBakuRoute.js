const express = require("express");
const {
  addBahanBaku,
  updateBahanBaku,
  getAllBahanBaku,
  deleteBahanBaku,
} = require("../controllers/BahanBaku.js");

const router = express.Router();

router.post("/bahanbaku", addBahanBaku);
router.patch("/bahanbaku/:id", updateBahanBaku);
router.get("/bahanbaku", getAllBahanBaku);
router.delete("/bahanbaku/:id", deleteBahanBaku);

module.exports = router;
