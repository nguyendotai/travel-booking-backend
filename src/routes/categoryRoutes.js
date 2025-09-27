const express = require("express");
const { getAllCategory, getCategoryById, getFixedCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/categoryController");
const {authMiddleware, adminMiddleware} = require("../middlewares/authMiddleware");
const router = express.Router();
const upload  = require("../middlewares/uploadMiddleware")

router.get("/", getAllCategory);
router.get("/fixed", getFixedCategories)
router.get("/:id", getCategoryById);
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createCategory);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateCategory);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

module.exports = router;