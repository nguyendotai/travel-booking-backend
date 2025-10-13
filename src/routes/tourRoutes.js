// routes/tourRoutes.js
const express = require("express");
const router = express.Router();
const {
  getAllTours,
  getTourBySlug,
  createTour,
  updateTour,
  deleteTour,
  getToursByCategory,
  getToursByFixedCategory,
  getHotDeals,
  searchTours,
  getToursByDestination
} = require("../controllers/tourController");

const { adminMiddleware, authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", getAllTours);
router.get("/category/:categoryId", getToursByCategory);
router.get("/fixed-category/:slug", getToursByFixedCategory);
router.get("/hot-deals", getHotDeals);
router.get("/search", searchTours);
router.get("/destination/:destinationId", getToursByDestination);
router.get("/:slug", getTourBySlug);

router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createTour);
router.put("/:slug", authMiddleware, adminMiddleware, upload.single("image"), updateTour);
router.delete("/:id", authMiddleware, adminMiddleware, deleteTour);

module.exports = router;
