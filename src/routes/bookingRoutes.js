const express = require("express");
const { createBooking, getMyBookings, updateBookingStatus } = require("../controllers/bookingController");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.get("/my", authMiddleware, getMyBookings);
router.patch("/:id", authMiddleware, adminMiddleware, updateBookingStatus);

module.exports = router;
