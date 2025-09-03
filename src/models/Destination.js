const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Destination = sequelize.define("Destination", {
  name: { type: DataTypes.STRING, allowNull: false },
  location_id: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Destination;
