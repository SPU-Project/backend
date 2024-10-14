import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const env = process.env.NODE_ENV || "development";

const config = {
  development: {
    host: "localhost",
    username: "postgres",
    password: "hasan123",
    database: "spuofficial",
    dialect: "postgresql",
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

export default db;
