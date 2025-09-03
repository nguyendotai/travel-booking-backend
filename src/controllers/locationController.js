const Location = require("../models/Location");
const Category = require("../models/Category");

// Lấy tất cả location, có thể lọc theo fixedCategoryId
exports.getAllLocation = async (req, res) => {
    try {
        const { categoryId } = req.query; // optional: ?categoryId=1
        const where = categoryId ? { fixedCategoryId: categoryId } : {};

        const locations = await Location.findAll({
            where,
            include: [
                { model: Category, as: "fixedCategory", attributes: ["id", "name", "type"] }
            ]
        });
        res.json(locations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Tạo Location mới, bắt buộc có fixedCategoryId
exports.createLocation = async (req, res) => {
    try {
        const { name, country, description, startDate, endDate, fixedCategoryId } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Tên địa điểm là bắt buộc" });
        }

        if (!fixedCategoryId) {
            return res.status(400).json({ error: "Fixed Category là bắt buộc" });
        }

        const category = await Category.findByPk(fixedCategoryId);
        if (!category || category.type !== "fixed") {
            return res.status(400).json({ error: "Danh mục không hợp lệ hoặc không phải fixed" });
        }

        const existing = await Location.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ error: "Địa điểm này đã tồn tại" });
        }

        const location = await Location.create({
            name: name.trim(),
            country: country?.trim() || null,
            description: description?.trim() || null,
            startDate: startDate || null,
            endDate: endDate || null,
            fixedCategoryId
        });

        res.status(201).json({
            success: true,
            data: location,
            message: "Thêm địa điểm thành công"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Lấy location theo id, kèm thông tin fixed category
exports.getLocationById = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id, {
            include: [{ model: Category, as: "fixedCategory", attributes: ["id", "name", "type"] }]
        });
        if (!location) return res.status(404).json({ error: "Không có địa điểm" });
        res.json(location);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Cập nhật location
exports.updateLocation = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) return res.status(404).json({ error: "Không có địa điểm" });

        const { fixedCategoryId } = req.body;
        if (fixedCategoryId) {
            const category = await Category.findByPk(fixedCategoryId);
            if (!category || category.type !== "fixed") {
                return res.status(400).json({ error: "Danh mục không hợp lệ hoặc không phải fixed" });
            }
        }

        await location.update(req.body);
        res.json(location);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Xoá location
exports.deleteLocation = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) return res.status(404).json({ error: "Không có địa điểm" });

        // Kiểm tra liên kết nếu cần (ví dụ tour, hotel)
        const tours = await location.getTours();
        if (tours.length > 0) {
            return res.status(400).json({ error: "Địa điểm này đang được dùng cho Tour, không thể xoá" });
        }

        await location.destroy();
        res.json({ message: "Xóa địa điểm thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
