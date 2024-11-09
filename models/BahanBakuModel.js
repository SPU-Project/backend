// models/BahanBakuModel.js

const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");

const BahanBakuModel = db.define(
  "bahanbakumodel",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BahanBaku: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure uniqueness
      validate: {
        notEmpty: true,
      },
    },
    Harga: {
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

module.exports = BahanBakuModel;
