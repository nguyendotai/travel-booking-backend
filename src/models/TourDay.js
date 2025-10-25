const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TourDay = sequelize.define("TourDay", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  tourId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: "Khóa ngoại tới bảng Tour"
  },
  dayNumber: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(200) },
  description: { type: DataTypes.TEXT }
}, { timestamps: true, tableName: "tourdays" });

module.exports = TourDay;