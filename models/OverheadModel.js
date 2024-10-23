// models/OverheadModel.js
const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");
const ProdukModel = require("./ProdukModel.js");

const OverheadModel = db.define(
  "overhead",
  {
    namaOverhead: {
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

// Relasi Overhead dengan Produk
OverheadModel.belongsTo(ProdukModel);
ProdukModel.hasMany(OverheadModel);

module.exports = OverheadModel;
