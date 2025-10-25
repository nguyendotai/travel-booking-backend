const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cấu hình Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "travel-booking", // thư mục lưu ảnh trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 600, crop: "limit" }],
  },
});

// Khởi tạo Multer với Cloudinary storage
const upload = multer({ storage });

module.exports = upload;
