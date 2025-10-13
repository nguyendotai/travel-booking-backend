// models/TourDestination.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TourDestination = sequelize.define("TourDestination", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  tour_id: { type: DataTypes.BIGINT },
  destination_id: { type: DataTypes.BIGINT },
}, { timestamps: false, tableName: "tourdestinations" });

module.exports = TourDestination;
