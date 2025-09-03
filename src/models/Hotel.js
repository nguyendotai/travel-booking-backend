const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Hotel = sequelize.define("Hotel", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: DataTypes.STRING,
  address: DataTypes.STRING,
  stars: DataTypes.INTEGER,
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Locations",
      key: "id"
    }
  }
});

module.exports = Hotel;