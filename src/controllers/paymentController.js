const { Payment, Booking } = require("../models");

exports.createPayment = async (req, res) => {
    try {
        const { bookingId, payment_method, payment_status, paid_at } = req.body;
        const booking = await Booking.findByPk(bookingId);
        if (!booking) return res.status(404).json({ message: "Booking not found" });

        const payment = await Payment.create({
            bookingId,
            payment_method,
            payment_status,
            paid_at
        });

        res.json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
