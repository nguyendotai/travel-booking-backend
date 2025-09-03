const express = require("express");
const { register, login } = require("../controllers/authController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// check admin
router.get("/me", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
