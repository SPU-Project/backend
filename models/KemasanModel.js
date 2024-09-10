// models/KemasanModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import ProdukModel from "./ProdukModel.js";

const KemasanModel = db.define('kemasan', {
    namaKemasan: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    harga: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
}, {
    freezeTableName: true
});

// Relasi Kemasan dengan Produk
KemasanModel.belongsTo(ProdukModel);
ProdukModel.hasMany(KemasanModel);

export default KemasanModel;
