const { Sequelize } = require("sequelize"); // Perbaiki spasi di sini
const db = require("../config/Database.js");

const RiwayatLog = db.define(
  "RiwayatLog",
  {
    username: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: false,
      unique: false,
      validate: {
        notEmpty: true,
      },
    },
    role: {
      type: Sequelize.DataTypes.STRING, // Gunakan Sequelize.DataTypes di sini
      allowNull: false,
      unique: false,
      validate: {
        notEmpty: true,
      },
    },
    date: {
      type: Sequelize.DataTypes.DATE, // Menggunakan DATE untuk timestamp
      allowNull: false,
      defaultValue: Sequelize.NOW, // Menyimpan timestamp otomatis saat record dibuat
      validate: {
        notEmpty: true,
      },
    },
    description: {
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

module.exports = RiwayatLog;
