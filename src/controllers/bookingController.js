const { Booking, Tour } = require("../models");

exports.createBooking = async (req, res) => {
    try {
        const { tourId, quantity } = req.body;
        const tour = await Tour.findByPk(tourId);
        if (!tour) return res.status(404).json({ message: "Tour not found" })

        const total_price = tour.price * quantity;
        const booking = await Booking.create({
            userId: req.user.id,
            tourId,
            quantity,
            total_price
        });
        res.json(booking);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
  const bookings = await Booking.findAll({
    where: { userId: req.user.id },
    include: ["Tour"]
  });
  res.json(bookings);
};

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