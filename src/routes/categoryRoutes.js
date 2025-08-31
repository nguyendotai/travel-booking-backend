const express = require("express");
const { getAllCategory, getCategoryById, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const {authMiddleware, adminMiddleware} = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", getAllCategory);
router.get("/:id", getCategoryById);
router.post("/", authMiddleware, adminMiddleware, createCategory);
router.put("/:id", authMiddleware, adminMiddleware, updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;