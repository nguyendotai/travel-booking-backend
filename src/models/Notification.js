const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  message: { type: DataTypes.STRING(255), allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

module.exports = Notification;
  