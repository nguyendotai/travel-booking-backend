const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

exports.getAllCategory = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getFixedCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { type: "fixed" }
        });
        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res
                .status(404)
                .json({ success: false, error: "Category không tồn tại" });
        }

        res.json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const { name, description, type, startDate, endDate, status } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ success: false, error: "Tên danh mục là bắt buộc" });
        }

        const existing = await Category.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ success: false, error: "Danh mục này đã tồn tại" });
        }

        // Validate cho optional
        if (type === "optional" && (!startDate || !endDate)) {
            return res.status(400).json({
                success: false,
                error: "Danh mục optional phải có startDate và endDate",
            });
        }

        const category = await Category.create({
            name: name.trim(),
            slug: Category.slugify(name), // tạo slug tự động
            description: description?.trim() || null,
            type: type || "fixed",
            startDate: type === "optional" ? startDate : null,
            endDate: type === "optional" ? endDate : null,
            status:
                typeof status !== "undefined"
                    ? status === "true" || status === true
                    : true,
            image: req.file ? req.file.path : null,
        });

        res.status(201).json({
            success: true,
            data: category,
            message: "Tạo danh mục thành công",
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, type, startDate, endDate, status } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ success: false, error: "Không có danh mục" });
        }

        if (name) {
            const existing = await Category.findOne({ where: { name } });
            if (existing && existing.id !== category.id) {
                return res
                    .status(400)
                    .json({ success: false, error: "Tên danh mục đã tồn tại" });
            }
            category.slug = Category.slugify(name); // cập nhật slug khi đổi name
            category.name = name;
        }

        if (type === "optional" && (!startDate || !endDate)) {
            return res.status(400).json({
                success: false,
                error: "Danh mục optional phải có startDate và endDate",
            });
        }

        if (req.file) {
            // Xóa ảnh cũ trên Cloudinary nếu có
            if (category.image && category.image.includes("cloudinary.com")) {
                const publicId = category.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`travel-booking/${publicId}`);
            }

            // Upload ảnh mới
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "travel-booking/categories",
            });

            category.image = result.secure_url;
        }

        category.name = name || category.name;
        category.description = description || category.description;
        category.type = type || category.type;
        category.startDate = type === "optional" ? startDate : null;
        category.endDate = type === "optional" ? endDate : null;

        if (typeof status !== "undefined") {
            category.status = (status === "true" || status === true);
        }

        await category.save();
        res.json({
            success: true,
            data: category,
            message: "Cập nhật danh mục thành công",
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res
                .status(404)
                .json({ success: false, error: "Không có danh mục" });
        }

        // Kiểm tra nếu category đã liên kết tour
        const tours = await category.getTours();
        if (tours.length > 0) {
            return res.status(400).json({
                success: false,
                error: "Danh mục này đang được dùng cho Tour, không thể xoá",
            });
        }

        // Xoá ảnh nếu có
        if (category.image) {
            const oldPath = path.join(
                __dirname,
                "../uploads",
                path.basename(category.image)
            );
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        await category.destroy();
        res.json({ success: true, message: "Xóa danh mục thành công" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
