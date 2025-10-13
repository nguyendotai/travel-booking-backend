const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Đăng ký user
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Mật khẩu không khớp nhau!" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      role: "user", // mặc định role là user
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login cho user (customer)
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Nhập email hoặc mật khẩu" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    if (user.role !== "user") {
      return res.status(403).json({ message: "Tài khoản không hợp lệ" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login cho admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Nhập email hoặc mật khẩu" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Email không tồn tại!" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được phép đăng nhập" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// 🧠 Lấy thông tin người dùng hiện tại
// =========================
exports.getMe = async (req, res) => {
  try {
    // req.user được gắn vào từ middleware xác thực token
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phone", "role", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// =========================
// ✏️ Cập nhật thông tin người dùng
// =========================
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    // Cập nhật các trường được cho phép
    user.name = name || user.name;
    user.phone = phone || user.phone;
    await user.save();

    res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công!",
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
