const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  message: DataTypes.STRING,
  type: DataTypes.STRING,
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = Notification;