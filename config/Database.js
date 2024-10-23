const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const env = "development";

const config = {
  development: {
    username: "postgres",
    password: "hasan123",
    database: "spuofficial",
    host: "localhost",
    dialect: "postgres",
  },
  production: {
    host: "apiv2.pabrikbumbu.com",
    username: "panganutama_admin",
    password: "Z5O4aG$WXK8(",
    database: "panganutama_spuofficial",
    dialect: "mysql",
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
