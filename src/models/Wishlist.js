const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Wishlist = sequelize.define("Wishlist", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
});

module.exports = Wishlist;