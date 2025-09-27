// routes/tourRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  getToursByCategory,
  getToursByFixedCategory,
  getHotDeals
} = require("../controllers/tourController");

const { adminMiddleware, authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", getAllTours);
router.get("/category/:categoryId", getToursByCategory);
router.get("/fixed-category/:slug", getToursByFixedCategory);
router.get("/hot-deals", getHotDeals);
router.get("/:id", getTourById);

router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createTour);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateTour);
router.delete("/:id", authMiddleware, adminMiddleware, deleteTour);

module.exports = router;
