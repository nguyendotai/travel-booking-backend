const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  method: { type: DataTypes.ENUM("credit_card","paypal","bank_transfer","cash"), allowNull: false },
  status: { type: DataTypes.ENUM("pending","paid","failed"), defaultValue: "pending" },
}, { timestamps: true, tableName: "payments" });

module.exports = Payment;
