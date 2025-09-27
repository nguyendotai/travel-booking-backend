const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TourDestination = sequelize.define("TourDestination", {
  tour_id: { type: DataTypes.BIGINT, primaryKey: true },
  destination_id: { type: DataTypes.BIGINT, primaryKey: true },
}, { timestamps: false });

module.exports = TourDestination;
