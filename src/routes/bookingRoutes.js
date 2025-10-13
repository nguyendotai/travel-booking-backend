const express = require("express");
const {
  createBookingAndPayment,
  confirmPayment,
  stripeWebhook,
  getMyBookings,
  updateBookingStatus,
  getAllBookings,
  getBookingById,
  deleteBooking,
} = require("../controllers/bookingController");

const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/stripe-webhook", express.raw({ type: "application/json" }),
  stripeWebhook);
  
// 🧳 User đặt tour
router.post("/", authMiddleware, createBookingAndPayment);

// 🧾 Xác nhận thanh toán (COD / Bank)
router.post("/confirm", confirmPayment);

// 🧍‍♂️ User xem danh sách booking của mình
router.get("/my", authMiddleware, getMyBookings);

// 👨‍💼 Admin: Quản lý tất cả booking
router.get("/admin", authMiddleware, adminMiddleware, getAllBookings);
router.get("/:id", authMiddleware, adminMiddleware, getBookingById);
router.patch("/:id", authMiddleware, adminMiddleware, updateBookingStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteBooking);


module.exports = router;
