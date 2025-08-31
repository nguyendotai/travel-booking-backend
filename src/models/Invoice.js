const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Invoice = sequelize.define("Invoice", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    issueDate: DataTypes.DATE,
    totalAmount: DataTypes.DECIMAL(12, 2),
    status: { type: DataTypes.ENUM("unpaid", "paid"), defaultValue: "unpaid" },
});

module.exports = Invoice;