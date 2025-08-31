const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Guide = sequelize.define("Guide", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  experienceYears: DataTypes.INTEGER,
});

module.exports = Guide;


