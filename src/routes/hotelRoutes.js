const express = require("express");
const router = express.Router();
const { createHotel, getAllHotel } = require("../controllers/hotelController");

const {adminMiddleware, authMiddleware} = require("../middlewares/authMiddleware");

router.get("/", getAllHotel);
router.post("/", authMiddleware, adminMiddleware, createHotel);

module.exports = router;