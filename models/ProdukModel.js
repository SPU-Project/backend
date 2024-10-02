// models/ProdukModel.js

import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const ProdukModel = db.define(
  "produk",
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

export default ProdukModel;
