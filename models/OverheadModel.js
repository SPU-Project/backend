// models/OverheadModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import ProdukModel from "./ProdukModel.js";

const OverheadModel = db.define('overhead', {
    namaOverhead: {
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

// Relasi Overhead dengan Produk
OverheadModel.belongsTo(ProdukModel);
ProdukModel.hasMany(OverheadModel);

export default OverheadModel;
