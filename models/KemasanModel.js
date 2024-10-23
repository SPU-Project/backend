// models/KemasanModel.js
const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");
const ProdukModel = require("../models/ProdukModel.js");

const KemasanModel = db.define(
  "kemasan",
  {
    namaKemasan: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    harga: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
  }
);

// Relasi Kemasan dengan Produk
KemasanModel.belongsTo(ProdukModel);
ProdukModel.hasMany(KemasanModel);

module.exports = KemasanModel;
