const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Complaint = sequelize.define("Complaint", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  subject: DataTypes.STRING,
  description: DataTypes.TEXT,
  status: { type: DataTypes.ENUM("pending", "resolved", "rejected"), defaultValue: "pending" },
});

module.exports = Complaint;