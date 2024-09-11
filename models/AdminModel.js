import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const Admin = db.define('admin', {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    uuid:{
        type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
        defaultValue: Sequelize.DataTypes.UUIDV4,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    email:{
        type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isEmail: true
        }
    },
    password:{
        type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
        allowNull: false,
        validate: {
            notEmpty: true,
            
        }
    },
    username:{
        type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
        }
    },
    profileImage: { // Tambahkan kolom untuk menyimpan path gambar
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: false,
        }
    }

}, {
    freezeTableName: true
});

export default Admin;
