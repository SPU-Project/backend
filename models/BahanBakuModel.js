const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");

const BahanBakuModel = db.define(
  "bahanbakumodel",
  {
    BahanBaku: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    Harga: {
      type: Sequelize.DataTypes.INTEGER, // Gunakan Sequelize.DataTypes di sini
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
