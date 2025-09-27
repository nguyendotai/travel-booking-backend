const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Destination = sequelize.define("Destination", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.BOOLEAN, allowNull: false,
    defaultValue: true
  },
  image: { type: DataTypes.STRING(255) },
  featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, { timestamps: true });

module.exports = Destination;
