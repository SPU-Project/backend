// models/ProdukModel.js
const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");

const ProdukModel = db.define(
  "ProdukModel",
  {
    namaProduk: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    hpp: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    margin20: {
      type: Sequelize.DataTypes.INTEGER,
    },
    margin30: {
      type: Sequelize.DataTypes.INTEGER,
    },
    margin40: {
      type: Sequelize.DataTypes.INTEGER,
    },
    margin50: {
      type: Sequelize.DataTypes.INTEGER,
    },
    margin60: {
      type: Sequelize.DataTypes.INTEGER,
    },
    margin70: {
      type: Sequelize.DataTypes.INTEGER,
    },
    margin80: {
      type: Sequelize.DataTypes.INTEGER,
    },
    margin90: {
      type: Sequelize.DataTypes.INTEGER,
    },
    margin100: {
      type: Sequelize.DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = ProdukModel;
