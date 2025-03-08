const ProdukModel = require("../models/ProdukModel.js");

const getNextBatchNumber = async (prefix, yy, mm) => {
  // Gabungkan prefix+YY+MM jadi "GAR2503"
  const prefixBulan = `${prefix}${yy}${mm}`;

  // Cari produk terakhir di DB yang KodeProduksi diawali prefixBulan
  // Gunakan Sequelize Op.like => KodeProduksi LIKE 'GAR2503%'
  const { Op } = require("sequelize");
  const lastProduct = await ProdukModel.findOne({
    where: {
      KodeProduksi: {
        [Op.like]: `${prefixBulan}%`,
      },
    },
    order: [["createdAt", "DESC"]], // cari yg terbaru
  });

  if (!lastProduct) {
    // Jika belum ada produk di bulan ini, batch = 1
    return 1;
  }

  // lastProduct.KodeProduksi misal "GAR2503-12"
  // Kita perlu ambil substring setelah "-"
  const kode = lastProduct.KodeProduksi; // "GAR2503-12"
  const batchStr = kode.split("-")[1]; // "12"
  const lastBatch = parseInt(batchStr, 10) || 0; // 12

  return lastBatch + 1; // 13
};

module.exports = getNextBatchNumber;
