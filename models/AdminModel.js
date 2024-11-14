const { Sequelize } = require("sequelize"); // Perbaiki spasi di sini
const db = require("../config/Database.js");

const Admin = db.define(
  "Admin",
  {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uuid: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isEmail: true,
      },
    },
    password: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    username: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    profileImage: {
      // Tambahkan kolom untuk menyimpan path gambar
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
      validate: {
        notEmpty: false,
      },
    },
    role: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
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

module.exports = Admin;
