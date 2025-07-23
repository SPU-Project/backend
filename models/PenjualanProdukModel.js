const { Sequelize } = require("sequelize"); // Perbaiki spasi di sini
const db = require("../config/Database.js");

const PenjualanProdukModel = db.define(
  "PenjualanProdukModel",
  {
    NamaProduk: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      unique: false,
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
    JumlahProduksi: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    Margin: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    Terjual: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    HargaSatuan: {
      type: Sequelize.DataTypes.DECIMAL(10, 3), // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    Pendapatan: {
      type: Sequelize.DataTypes.DECIMAL(10, 3), // Gunakan Sequelize.DataTypes di sini
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = PenjualanProdukModel;
