import express from "express";
import {
  addBahanBaku,
  updateBahanBaku,
  getAllBahanBaku,
  deleteBahanBaku,
} from "../controllers/BahanBaku.js";

const router = express.Router();

router.post("/bahanbaku", addBahanBaku);
router.patch("/bahanbaku/:id", updateBahanBaku);
router.get("/bahanbaku", getAllBahanBaku);
router.delete("/bahanbaku/:id", deleteBahanBaku);

export default router;
