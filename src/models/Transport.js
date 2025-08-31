const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Transport = sequelize.define("Transport", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    type: DataTypes.ENUM("bus", "train", "plane", "boat", "car"),
    provider: DataTypes.STRING,
});

module.exports = Transport;