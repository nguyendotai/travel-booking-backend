const express = require("express");
const router = express.Router();
const { getAllDestination, createDestination } = require("../controllers/destinationController");

const {adminMiddleware, authMiddleware} = require("../middlewares/authMiddleware");

router.get("/", getAllDestination);
router.post("/", authMiddleware, adminMiddleware, createDestination)

module.exports = router;
