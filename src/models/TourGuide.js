const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TourGuide = sequelize.define("TourGuide", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
});

module.exports = TourGuide;