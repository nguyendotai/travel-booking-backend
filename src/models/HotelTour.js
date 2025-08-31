const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const HotelTour = sequelize.define("HotelTour", {
    hotel_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    tour_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: "hotel_tours",
    timestamps: false,
});

module.exports = HotelTour;
