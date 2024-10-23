const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    username: process.env.PGUSER_DEV,
    password: process.env.PGPASSWORD_DEV,
    database: process.env.PGDATABASE_DEV,
    host: process.env.PGHOST_DEV,
    dialect: process.env.PGDIALECT_DEV,
  },
  test: {
    username: process.env.PGUSER_TEST,
    password: process.env.PGPASSWORD_TEST,
    database: process.env.PGDATABASE_TEST,
    host: process.env.PGHOST_TEST,
    dialect: process.env.PGDIALECT_TEST,
  },
  production: {
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    host: process.env.PGHOST,
    dialect: process.env.PGDIALECT,
  },
};

// Ambil konfigurasi berdasarkan environment
const currentConfig = config[env];

const db = new Sequelize(
  currentConfig.database,
  currentConfig.username,
  currentConfig.password,
  {
    host: currentConfig.host,
    dialect: currentConfig.dialect,
    port: currentConfig.port,
    logging: false, // Matikan logging jika tidak diperlukan
  }
);

module.exports = db;
