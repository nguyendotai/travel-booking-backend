const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Review = sequelize.define("Review", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
}, { timestamps: true, tableName: "reviews" });

module.exports = Review;
