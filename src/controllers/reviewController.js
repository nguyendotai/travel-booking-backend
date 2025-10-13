// controllers/reviewController.js
const Review = require("../models/Review");
const User = require("../models/User");
const Tour = require("../models/Tour");
const { Op } = require("sequelize");

exports.createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { tourId } = req.params;
        const user_id = req.user.id;

        const tour = await Tour.findByPk(tourId);
        if (!tour)
            return res.status(404).json({ success: false, message: "Tour không tồn tại" });

        const review = await Review.create({ user_id, tour_id: tourId, rating, comment });

        res.status(201).json({ success: true, message: "Thêm đánh giá thành công!", data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getReviewsByTour = async (req, res) => {
    try {
        const { tourId } = req.params;

        const reviews = await Review.findAll({
            where: { tour_id: tourId },
            include: [
                {
                    model: User,
                    attributes: ["id", "name", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        const avgRating =
            reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

        res.json({
            success: true,
            total: reviews.length,
            averageRating: Number(avgRating.toFixed(1)),
            data: reviews,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            where: { user_id: req.user.id },
            include: [
                {
                    model: Tour,
                    attributes: ["id", "name", "slug", "image"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findByPk(id);
        if (!review) {
            return res.status(404).json({ success: false, message: "Không tìm thấy review" });
        }

        if (review.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền sửa review này" });
        }

        review.rating = rating ?? review.rating;
        review.comment = comment ?? review.comment;
        await review.save();

        res.json({ success: true, message: "Cập nhật review thành công", data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Không tìm thấy review" });
        }

        // Chỉ chủ review hoặc admin mới được xóa
        if (review.user_id !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Bạn không có quyền xóa review này" });
        }

        await review.destroy();

        res.json({ success: true, message: "Xóa review thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, attributes: ["id", "name", "email"] },
                { model: Tour, attributes: ["id", "name", "slug"] },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
