const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Room = sequelize.define("Room", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: DataTypes.STRING,
  pricePerNight: DataTypes.DECIMAL(12, 2),
  capacity: DataTypes.INTEGER,
});

module.exports = Room;