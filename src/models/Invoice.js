const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Invoice = sequelize.define("Invoice", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  total: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  issued_date: { type: DataTypes.DATEONLY, allowNull: false },
}, { timestamps: true, tableName: "invoices" });

module.exports = Invoice;
