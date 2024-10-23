// models/ProdukBahanBakuModel.js

const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");
const ProdukModel = require("./ProdukModel.js");
const BahanBakuModel = require("./BahanBakuModel.js");

const ProdukBahanBakuModel = db.define(
  "ProdukBahanBaku",
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
// Asosiasi
ProdukBahanBakuModel.belongsTo(BahanBakuModel, {
  foreignKey: "bahanBakuId",
  as: "bahanBaku",
});

ProdukBahanBakuModel.belongsTo(ProdukModel, {
  foreignKey: "produkId",
  as: "produk",
});

module.exports = ProdukBahanBakuModel;
