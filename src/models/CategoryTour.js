const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const CategoryTour = sequelize.define("CategoryTour", {
    type: {
        type: DataTypes.ENUM("fixed", "optional"),
        allowNull: false,
        defaultValue: "fixed",
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: true, // dùng cho event/mùa vụ
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: "categories_tour",
    timestamps: false
});

module.exports = CategoryTour;
