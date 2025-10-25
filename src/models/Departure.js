const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Departure = sequelize.define("Departure", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        comment: "Tên điểm khởi hành (VD: Hà Nội, TP. Hồ Chí Minh)"
    },

    province: {
        type: DataTypes.STRING(200),
        allowNull: false,
    }
}, { timestamps: true, tableName: "departures" });

module.exports = Departure;
