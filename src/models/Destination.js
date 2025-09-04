const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Destination = sequelize.define("Destination", {
  name: { type: DataTypes.STRING, allowNull: false },
  location_id: { type: DataTypes.INTEGER, allowNull: false },
  image: DataTypes.STRING,
});

module.exports = Destination;
