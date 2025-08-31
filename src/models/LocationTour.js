const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LocationTour = sequelize.define("LocationTour", {}, {
    tableName: "locations_tour",
    timestamps: false
});

module.exports = LocationTour;
