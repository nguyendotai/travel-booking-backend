const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Promotion = sequelize.define("Promotion", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: DataTypes.STRING,
  discountPercent: DataTypes.INTEGER,
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
});

module.exports = Promotion;