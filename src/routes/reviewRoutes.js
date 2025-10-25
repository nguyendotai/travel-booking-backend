const express = require("express");
const router = express.Router();
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const reviewController = require("../controllers/reviewController");

// Người dùng
router.get("/",  reviewController.getAllReviews)
router.post("/tour/:tourId", authMiddleware, reviewController.createReview);
router.get("/my", authMiddleware, reviewController.getMyReviews);
router.put("/:id", authMiddleware, reviewController.updateReview);
router.delete("/:id", authMiddleware, reviewController.deleteReview);

// Public
router.get("/tour/:tourId", reviewController.getReviewsByTour);

// Admin
router.get("/admin", authMiddleware, adminMiddleware, reviewController.getAllReviews);

module.exports = router;
