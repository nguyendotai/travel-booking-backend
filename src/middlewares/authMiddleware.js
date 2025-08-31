const jwt = require("jsonwebtoken");
const { User } = require("../models");

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Not admin" });
  next();
};
