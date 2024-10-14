import { Sequelize } from "sequelize";

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
const currentConfig = config["development"];

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
