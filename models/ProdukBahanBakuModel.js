// models/ProdukBahanBakuModel.js

import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import ProdukModel from "./ProdukModel.js";
import BahanBakuModel from "./BahanBakuModel.js";

const ProdukBahanBakuModel = db.define('ProdukBahanBaku', {
    jumlah: {
        type: Sequelize.DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notEmpty: true,
        }
    },
    produkId: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
            model: ProdukModel,
            key: 'id'
        },
        allowNull: false
    },
    bahanBakuId: {
        type: Sequelize.DataTypes.INTEGER,
        references: {
            model: BahanBakuModel,
            key: 'id'
        },
        allowNull: false
    }
}, {
    freezeTableName: true
});
// Definisikan asosiasi secara eksplisit
ProdukModel.belongsToMany(BahanBakuModel, {
    through: ProdukBahanBakuModel,
    foreignKey: 'produkId',
    otherKey: 'bahanBakuId'
});
BahanBakuModel.belongsToMany(ProdukModel, {
    through: ProdukBahanBakuModel,
    foreignKey: 'bahanBakuId',
    otherKey: 'produkId'
});

export default ProdukBahanBakuModel;
