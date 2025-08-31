const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Review = sequelize.define("Review", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  rating: DataTypes.INTEGER,
  comment: DataTypes.TEXT,
});

module.exports = Review;