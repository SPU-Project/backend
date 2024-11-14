// models/OverheadModel.js
const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");

const OverheadModel = db.define(
  "OverheadModel",
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

module.exports = OverheadModel;
