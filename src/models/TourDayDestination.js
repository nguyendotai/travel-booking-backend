const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const TourDay = require("./TourDay");
const Destination = require("./Destination");

const TourDayDestination = sequelize.define("TourDayDestination", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  tourDayId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: "Khóa ngoại tới bảng TourDay"
  },
  destinationId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: "Khóa ngoại tới bảng Destination"
  },
  order: { type: DataTypes.INTEGER, defaultValue: 1 } // Thứ tự tham quan
}, { timestamps: true, tableName: "tourdaydestinations" });

module.exports = TourDayDestination;
