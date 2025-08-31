const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TourSchedule = sequelize.define("TourSchedule", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    day: DataTypes.INTEGER,
    activity: DataTypes.TEXT,
});

module.exports = TourSchedule;