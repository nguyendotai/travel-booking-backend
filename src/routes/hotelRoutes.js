const express = require("express");
const router = express.Router();
const { createHotel, getAllHotel, deleteHotel } = require("../controllers/hotelController");

const {adminMiddleware, authMiddleware} = require("../middlewares/authMiddleware");

router.get("/", getAllHotel);
router.post("/", authMiddleware, adminMiddleware, createHotel);
router.delete("/:id", authMiddleware, adminMiddleware, deleteHotel);

module.exports = router;