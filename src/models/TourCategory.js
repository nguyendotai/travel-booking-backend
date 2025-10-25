const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TourCategory = sequelize.define("TourCategory", {
  tour_id: { type: DataTypes.BIGINT, primaryKey: true },
  category_id: { type: DataTypes.BIGINT, primaryKey: true },
}, { timestamps: false, tableName: "tourcategories" });

module.exports = TourCategory;
