const express = require("express");
const router = express.Router();
const {getStatistical, getRecentBooking} = require("../controllers/dashboardController");

router.get("/stats", getStatistical);
router.get("/recent-bookings", getRecentBooking);

module.exports = router;