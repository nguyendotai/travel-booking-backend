const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Hàm tạo slug
function slugify(str) {
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const Category = sequelize.define(
  "Category",
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN },
    type: { type: DataTypes.ENUM("fixed", "optional"), allowNull: false },
    startDate: { type: DataTypes.DATE, allowNull: true },
    endDate: { type: DataTypes.DATE, allowNull: true },
  },
  { timestamps: true, tableName: "categories" }
);

// Gắn hàm slugify vào model để tái sử dụng
Category.slugify = slugify;

module.exports = Category;
