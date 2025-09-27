const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const HotelLocation = sequelize.define("HotelLocation", {
  hotel_id: {
    type: DataTypes.BIGINT,
    references: { model: "Hotels", key: "id" }
  },
  location_id: {
    type: DataTypes.BIGINT,
    references: { model: "Locations", key: "id" }
  }
}, { tableName: "hotellocations", timestamps: false });

module.exports = HotelLocation;
