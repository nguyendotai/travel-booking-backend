const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Tour = require("../models/Tour");

// Đặt tour + tạo thanh toán
exports.createBookingAndPayment = async (req, res) => {
  try {
    const { tour_id, quantity, method } = req.body;
    const user_id = req.user.id;

    const tour = await Tour.findByPk(tour_id);
    if (!tour) return res.status(404).json({ message: "Tour không tồn tại" });

    if (tour.capacity < quantity) {
      return res.status(400).json({ message: "Số lượng chỗ còn lại không đủ!" });
    }

    const unitPrice =
      tour.salePrice && Number(tour.salePrice) < Number(tour.price)
        ? Number(tour.salePrice)
        : Number(tour.price);

    const total = unitPrice * quantity;

    // Managed transaction
    const { booking, payment } = await Booking.sequelize.transaction(async (t) => {
      const b = await Booking.create(
        { user_id, tour_id, quantity, total_price: total, status: "pending" },
        { transaction: t }
      );

      tour.capacity -= quantity;
      await tour.save({ transaction: t });

      const p = await Payment.create(
        { booking_id: b.id, amount: total, method, status: "pending" },
        { transaction: t }
      );

      return { booking: b, payment: p };
    });

    // Stripe xử lý sau khi transaction đã commit xong
    if (method === "stripe") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "vnd",
              product_data: { name: tour.name },
              unit_amount: total,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://localhost:3001/payment-success?bookingId=${booking.id}`,
        cancel_url: `http://localhost:3001/payment-cancel?bookingId=${booking.id}`,
      });

      return res.json({
        message: "Đặt tour thành công, redirect tới Stripe",
        booking,
        payment,
        checkoutUrl: session.url,
      });
    }

    return res.json({
      message: "Đặt tour thành công, chờ thanh toán",
      booking,
      payment,
    });
  } catch (err) {
    // Không cần rollback thủ công
    return res.status(500).json({ error: err.message });
  }
};


// Xác nhận thanh toán (cho COD / Bank)
exports.confirmPayment = async (req, res) => {
  const t = await Booking.sequelize.transaction();
  try {
    const { payment_id, status } = req.body; // "paid" | "failed"

    const payment = await Payment.findByPk(payment_id, { transaction: t });
    if (!payment) {
      await t.rollback();
      return res.status(404).json({ message: "Không tìm thấy payment" });
    }

    payment.status = status;
    await payment.save({ transaction: t });

    if (status === "paid") {
      await Booking.update(
        { status: "confirmed" },
        { where: { id: payment.booking_id }, transaction: t }
      );
    } else if (status === "failed") {
      await Booking.update(
        { status: "cancelled" },
        { where: { id: payment.booking_id }, transaction: t }
      );
    }

    if (status === "failed") {
      const booking = await Booking.findByPk(payment.booking_id, { transaction: t });
      if (booking) {
        const tour = await Tour.findByPk(booking.tour_id, { transaction: t });
        if (tour) {
          tour.capacity += booking.quantity;
          await tour.save({ transaction: t });
        }
      }

      await Booking.update(
        { status: "cancelled" },
        { where: { id: payment.booking_id }, transaction: t }
      );
    }


    await t.commit();

    return res.json({
      message: "Cập nhật thanh toán thành công",
      payment,
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ error: err.message });
  }
};

// Stripe webhook callback
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook verify failed:", err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  // 🧾 Khi thanh toán Stripe hoàn tất
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Lấy bookingId từ success_url (đã truyền ở lúc tạo session)
      const url = new URL(session.success_url);
      const bookingId = url.searchParams.get("bookingId");

      if (!bookingId) {
        console.error("⚠️ Không tìm thấy bookingId trong success_url");
        return res.json({ received: true });
      }

      // Transaction đảm bảo an toàn dữ liệu
      await Booking.sequelize.transaction(async (t) => {
        const booking = await Booking.findByPk(bookingId, { transaction: t });
        if (!booking) throw new Error("Booking không tồn tại");

        const payment = await Payment.findOne({
          where: { booking_id: bookingId },
          transaction: t,
        });

        if (!payment) throw new Error("Payment không tồn tại");

        const tour = await Tour.findByPk(booking.tour_id, { transaction: t });
        if (!tour) throw new Error("Tour không tồn tại");

        // Cập nhật trạng thái
        booking.status = "confirmed";
        await booking.save({ transaction: t });

        payment.status = "paid";
        await payment.save({ transaction: t });

        // Giảm capacity
        if (tour.capacity >= booking.quantity) {
          tour.capacity -= booking.quantity;
          await tour.save({ transaction: t });
        }
      });

      console.log("✅ Stripe webhook: Cập nhật thành công booking #" + bookingId);
    } catch (err) {
      console.error("❌ Stripe webhook error:", err.message);
    }
  }

  res.json({ received: true });
};


exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Tour },
        { model: Payment },
      ],
      order: [["createdAt", "DESC"]], // gợi ý: hiển thị mới nhất trước
    });

    res.json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Admin update trạng thái booking
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status;
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ===============
// 📋 Lấy tất cả booking (Admin)
// ===============
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Tour },
        { model: Payment },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============
// 🔍 Lấy chi tiết booking theo id (Admin)
// ===============
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Tour },
        { model: Payment },
      ],
    });

    if (!booking)
      return res.status(404).json({ success: false, message: "Không tìm thấy booking" });

    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ===============
// ❌ Xóa booking (Admin)
// ===============
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Không tìm thấy booking" });

    await booking.destroy();
    res.json({ success: true, message: "Xóa booking thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
