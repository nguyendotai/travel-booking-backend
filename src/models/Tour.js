const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Tour = sequelize.define("Tour", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  price: DataTypes.DECIMAL(12, 2),
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
  duration: DataTypes.INTEGER,
  capacity: DataTypes.INTEGER,
  status: { 
    type: DataTypes.ENUM("available", "full", "canceled"), 
    defaultValue: "available" 
  },
  fixedCategoryId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: { model: "Categories", key: "id" }  // bảng category
  }
});

module.exports = Tour;
