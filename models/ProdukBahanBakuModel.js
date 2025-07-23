// models/ProdukBahanBakuModel.js

const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");
const ProdukModel = require("./ProdukModel.js");
const BahanBakuModel = require("./BahanBakuModel.js");

const ProdukBahanBakuModel = db.define(
  "ProdukBahanBakuModel",
  {
    jumlah: {
      type: Sequelize.DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    produkId: {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: ProdukModel,
        key: "id",
      },
      allowNull: false,
    },
    bahanBakuId: {
      type: Sequelize.DataTypes.INTEGER,
      references: {
        model: BahanBakuModel,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = ProdukBahanBakuModel;
