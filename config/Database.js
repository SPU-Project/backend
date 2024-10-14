import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const env = process.env.NODE_ENV || "production";

const config = {
  development: {
    username: process.env.PGUSER_DEV,
    password: process.env.PGPASSWORD_DEV,
    database: process.env.PGDATABASE_DEV,
    host: process.env.PGHOST_DEV,
    dialect: process.env.PGDIALECT_DEV,
    port: process.env.PGPORT_DEV || 5432,
  },
  test: {
    username: process.env.PGUSER_TEST,
    password: process.env.PGPASSWORD_TEST,
    database: process.env.PGDATABASE_TEST,
    host: process.env.PGHOST_TEST,
    dialect: process.env.PGDIALECT_TEST,
    port: process.env.PGPORT_TEST || 5432,
  },
  production: {
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
