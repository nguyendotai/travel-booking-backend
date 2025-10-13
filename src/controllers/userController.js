const User = require("../models/User");
const bcrypt = require("bcrypt");

// 📄 Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "phone", "role", "createdAt"],
    });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 📄 Lấy thông tin 1 người dùng
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "phone", "role", "createdAt"],
    });
    if (!user)
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 📝 Cập nhật thông tin người dùng (dành cho admin)
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.role = role || user.role;

    await user.save();
    res.json({ success: true, message: "Cập nhật người dùng thành công!", user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ❌ Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });

    await user.destroy();
    res.json({ success: true, message: "Xóa người dùng thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
