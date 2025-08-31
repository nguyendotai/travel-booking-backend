const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AdminLog = sequelize.define("AdminLog", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  action: DataTypes.STRING,
  timestamp: DataTypes.DATE,
});

module.exports = AdminLog;

