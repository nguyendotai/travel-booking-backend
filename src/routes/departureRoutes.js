const express = require("express");
const router = express.Router();
const { getAllDeparture ,createDeparture } = require("../controllers/departureController");

const {adminMiddleware, authMiddleware} = require("../middlewares/authMiddleware");

router.get("/", getAllDeparture);
router.post("/", authMiddleware, adminMiddleware, createDeparture);

module.exports = router;