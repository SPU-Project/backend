// models/ProdukModel.js
const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");

const ProdukModel = db.define(
  "ProdukModel",
  {
    KodeProduksi: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    namaProduk: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    hpp: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    margin20: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
    },
    margin30: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
    },
    margin40: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
    },
    margin50: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
    },
    margin60: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
    },
    margin70: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
    },
    margin80: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
    },
    margin90: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
    },
    margin100: {
      type: Sequelize.DataTypes.DECIMAL(10, 3),
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = ProdukModel;
