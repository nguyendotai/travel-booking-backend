const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: DataTypes.DECIMAL(12, 2),
  method: DataTypes.ENUM("credit_card", "bank_transfer", "paypal", "cash"),
  status: { type: DataTypes.ENUM("pending", "paid", "failed"), defaultValue: "pending" },
});

module.exports = Payment;
