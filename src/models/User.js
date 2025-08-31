const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fullName: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
  role: { type: DataTypes.ENUM("customer", "guide", "admin"), defaultValue: "customer" },
  status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },
});

module.exports = User;
