const express = require("express");
const router = express.Router();
const { createLocation, getAllLocation, getLocationById, getLocationsByFixedCategory } = require("../controllers/locationController");
const { getDestinationsByLocation } = require("../controllers/destinationController");
const { getHotelsByLocation } = require("../controllers/hotelController")

const { adminMiddleware, authMiddleware } = require("../middlewares/authMiddleware");

router.get("/", getAllLocation)
router.post("/", authMiddleware, adminMiddleware, createLocation);
router.get("/:id", getLocationById);
router.get("/category/:slug", getLocationsByFixedCategory);

// Thêm 2 route mới
router.get("/:id/destinations", getDestinationsByLocation);
router.get("/:id/hotels", getHotelsByLocation);

module.exports = router;