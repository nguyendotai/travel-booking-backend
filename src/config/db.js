const { Sequelize } = require("sequelize");
const mysql = require("mysql2");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    define: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
    },
    port: Number(process.env.DB_PORT),
    dialectModule: mysql,
    logging: false,
    dialectOptions: {
      charset: "utf8mb4",
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

module.exports = sequelize;
