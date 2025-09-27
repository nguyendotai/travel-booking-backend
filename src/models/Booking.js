const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  total_price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  status: { type: DataTypes.ENUM("pending","confirmed","cancelled"), defaultValue: "pending" },
}, { timestamps: true });

module.exports = Booking;
