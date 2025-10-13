const Booking = require("../models/Booking");
const User = require("../models/User");
const Tour = require("../models/Tour")
const { Op } = require("sequelize");

exports.getStatistical = async (req, res) => {
    try {
        const totalBookings = await Booking.count();
        const totalRevenue = await Booking.sum("total_price") || 0;
        const activeUsers = await User.count({ where: { isActive: true } });

        res.json({
            totalBookings,
            totalRevenue,
            activeUsers,
            growth: {
                bookings: "+5%",
                revenue: "+10%",
                users: "+2%",
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRecentBooking = async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            include: [
                { model: User, attributes: ["name"] },
                { model: Tour, attributes: ["name"] },
            ],
            order: [["createdAt", "DESC"]],
            limit: 5,
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}