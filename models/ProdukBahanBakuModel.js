// models/ProdukBahanBakuModel.js

import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import ProdukModel from "./ProdukModel.js";
import BahanBakuModel from "./BahanBakuModel.js";

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

export default ProdukBahanBakuModel;
