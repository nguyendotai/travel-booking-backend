const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Location = sequelize.define("Location", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  country: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.BOOLEAN },
}, { timestamps: true, tableName: "locations" });

module.exports = Location;
