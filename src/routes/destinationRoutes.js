const express = require("express");
const router = express.Router();
const { getAllDestination, getDestinationById,getDestinationsByFixedCategory, createDestination, updateDestination, deleteDestination, getFeaturedDestinations } = require("../controllers/destinationController");

const {adminMiddleware, authMiddleware} = require("../middlewares/authMiddleware");
const upload  = require("../middlewares/uploadCloudinary")

router.get("/", getAllDestination);
router.get("/fixed/:type", getDestinationsByFixedCategory);
router.get("/featured", getFeaturedDestinations);
router.get("/:id", getDestinationById);
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), createDestination);

router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), updateDestination);
router.delete("/:id", authMiddleware, adminMiddleware, deleteDestination);

module.exports = router;

