const { Sequelize } = require("sequelize"); // Perbaiki spasi di sini
const db = require("../config/Database.js");

const StatusProduksiModel = db.define(
  "StatusProduksiModel",
  {
    KodeProduksi: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: false,
      unique: false,
      validate: {
        notEmpty: true,
      },
    },
    TanggalProduksi: {
      type: Sequelize.DataTypes.DATE, // Menggunakan DATE untuk timestamp
      allowNull: false,
      defaultValue: Sequelize.NOW, // Menyimpan timestamp otomatis saat record dibuat
      validate: {
        notEmpty: true,
      },
    },
    IdProduk: {
      type: Sequelize.DataTypes.INTEGER, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      unique: false,
      validate: {
        notEmpty: false,
      },
    },
    NamaProduk: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    Batch: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: true,
      },
    },
    BahanBaku: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    JumlahBahanBaku: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    Satuan: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    JumlahProduksi: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    StatusProduksi: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    TanggalSelesai: {
      type: Sequelize.DataTypes.DATE, // Menggunakan DATE untuk timestamp
      allowNull: true, // Menyimpan timestamp otomatis saat record dibuat
      validate: {
        notEmpty: false,
      },
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = StatusProduksiModel;
