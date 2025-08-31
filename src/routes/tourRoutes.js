// routes/tourRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getToursByCategory
} = require("../controllers/tourController");

const {adminMiddleware, authMiddleware} = require("../middlewares/authMiddleware");

router.get("/", getAllTours);
router.get("/:id", getTourById);
router.get("/category/:categoryId", getToursByCategory);

router.post("/", authMiddleware, adminMiddleware, createTour);
router.put("/:id", authMiddleware, adminMiddleware, updateTour);
router.delete("/:id", authMiddleware, adminMiddleware, deleteTour);

module.exports = router;
