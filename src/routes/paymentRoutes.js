const express = require("express");
const { createPayment } = require("../controllers/paymentController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, createPayment);

module.exports = router;
