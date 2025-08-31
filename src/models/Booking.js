const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Tour = require("./Tour");

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bookingDate: DataTypes.DATE,
  totalPrice: DataTypes.DECIMAL(12, 2),
  status: { type: DataTypes.ENUM("pending", "confirmed", "canceled"), defaultValue: "pending" },
});

module.exports = Booking;
