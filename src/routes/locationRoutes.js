const express = require("express");
const router = express.Router();
const { createLocation, updateLocation, deleteLocation, getAllLocation, getLocationById, getLocationsByFixedCategory } = require("../controllers/locationController");
const { getDestinationsByLocation } = require("../controllers/destinationController");
const { getHotelsByLocation } = require("../controllers/hotelController")

const { adminMiddleware, authMiddleware } = require("../middlewares/authMiddleware");

router.get("/", getAllLocation)
router.post("/", authMiddleware, adminMiddleware, createLocation);
router.put("/:id", authMiddleware, adminMiddleware, updateLocation);
router.delete("/:id", authMiddleware, adminMiddleware, deleteLocation);
router.get("/category/:slug", getLocationsByFixedCategory);
router.get("/:id", getLocationById);

// Thêm 2 route mới
router.get("/:id/destinations", getDestinationsByLocation);
router.get("/:id/hotels", getHotelsByLocation);

module.exports = router;