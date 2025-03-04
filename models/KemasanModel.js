// models/KemasanModel.js
const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");

const KemasanModel = db.define(
  "KemasanModel",
  {
    namaKemasan: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    harga: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
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

module.exports = KemasanModel;
