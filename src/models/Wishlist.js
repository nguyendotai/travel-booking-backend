const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Wishlist = sequelize.define("Wishlist", {
  user_id: { type: DataTypes.BIGINT, primaryKey: true },
  tour_id: { type: DataTypes.BIGINT, primaryKey: true },
}, { timestamps: true });

module.exports = Wishlist;
