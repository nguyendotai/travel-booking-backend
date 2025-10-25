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

const Tour = sequelize.define("Tour", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  startDate: { type: DataTypes.DATEONLY },
  endDate: { type: DataTypes.DATEONLY },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  capacity: { type: DataTypes.INTEGER, comment: "Số lượng khách tối đa" },
  image: { type: DataTypes.STRING(255) },
  status: {
    type: DataTypes.ENUM("draft", "active", "inactive", "completed"),
    defaultValue: "draft"
  },
   departureId: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: "Khóa ngoại tới bảng Departure"
  },
  tourStatus: {
    type: DataTypes.VIRTUAL,
    get() {
      const startDate = new Date(this.getDataValue("startDate"));
      const endDate = new Date(this.getDataValue("endDate"));
      const today = new Date();

      if (!startDate || !endDate) return "no-date";

      if (today < startDate) return "upcoming";   // Chưa bắt đầu
      if (today >= startDate && today <= endDate) return "ongoing"; // Đang diễn ra
      if (today > endDate) return "ended";        // Đã kết thúc

      return "unknown";
    }
  },
  discount: {
    type: DataTypes.INTEGER, // % giảm giá (0-100)
    defaultValue: 0
  },
  salePrice: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    get() {
      const price = parseFloat(this.getDataValue("price") || 0);
      const discount = parseInt(this.getDataValue("discount") || 0);
      if (discount > 0) {
        return (price * (100 - discount)) / 100;
      }
      return price;
    }
  },
  isHotDeal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: "Đánh dấu tour hot deal"
  }
}, { timestamps: true, tableName: "tours" });

Tour.slugify = slugify;

module.exports = Tour;
