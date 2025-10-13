const express = require("express");
const {
  register,
  loginUser,
  loginAdmin,
  getMe,
  updateProfile,
} = require("../controllers/authController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);

// Lấy thông tin user hiện tại
router.get("/me", authMiddleware, getMe);

// Cập nhật hồ sơ
router.put("/update", authMiddleware, updateProfile);

// Check admin
router.get("/admin/me", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
