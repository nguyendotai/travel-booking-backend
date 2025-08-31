const express = require("express");
const router = express.Router();
const { createLocation } = require("../controllers/locationController");

const {adminMiddleware, authMiddleware} = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, adminMiddleware, createLocation);

module.exports = router;