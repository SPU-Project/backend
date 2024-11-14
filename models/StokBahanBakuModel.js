// models/StokBahanBakuModel.js

const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");

const StokBahanBaku = db.define(
  "StokBahanBaku",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BahanBakuId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      unique: true, // Ensure one-to-one relationship
      references: {
        model: "bahanbakumodel",
        key: "id",
      },
    },
    BahanBaku: {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    },
    Stok: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
    },
    TanggalPembaruan: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = StokBahanBaku;
