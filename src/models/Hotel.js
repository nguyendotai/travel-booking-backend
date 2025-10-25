const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Hotel = sequelize.define("Hotel", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  address: { type: DataTypes.STRING(255) },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.BOOLEAN },
  rating: { type: DataTypes.FLOAT },
}, { timestamps: true, tableName: "hotels" });

module.exports = Hotel;
