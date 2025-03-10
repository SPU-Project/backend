// cronStatusProduksi.js
const cron = require("node-cron");
const { Op } = require("sequelize");
const StatusProduksiModel = require("../models/StatusProduksiModel.js");

/**
 * Cron job ini akan dijalankan setiap menit (* * * * *),
 * lalu melakukan update pada baris StatusProduksiModel
 * di mana TanggalSelesai <= waktu sekarang
 * dan StatusProduksi bukan "Selesai".
 */
const cronStatusProduksi = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      // Waktu saat ini
      const now = new Date();

      // Update semua record yang TanggalSelesai <= now
      // dan belum status "Selesai".
      const [rowsUpdated] = await StatusProduksiModel.update(
        { StatusProduksi: "Selesai" },
        {
          where: {
            TanggalSelesai: {
              [Op.lte]: now,
            },
            StatusProduksi: {
              [Op.ne]: "Selesai", // hanya update jika status belum "Selesai"
            },
          },
        }
      );

      if (rowsUpdated > 0) {
        console.log(`CronJob: ${rowsUpdated} baris diupdate menjadi "Selesai"`);
      }
    } catch (error) {
      console.error("CronJob Error:", error);
    }
  });
};

module.exports = cronStatusProduksi;
