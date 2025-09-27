const Location = require("../models/Location");
const Category = require("../models/Category");

// Lấy tất cả location, có thể lọc theo fixedCategoryId
exports.getAllLocation = async (req, res) => {
    try {

        const locations = await Location.findAll();
        res.json({
            success: true,
            data: locations,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Tạo Location mới, bắt buộc có fixedCategoryId
exports.createLocation = async (req, res) => {
    try {
        const { name, country, description, status, fixedCategoryId } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Tên địa điểm là bắt buộc" });
        }

        if (!fixedCategoryId) {
            return res.status(400).json({ error: "fixedCategoryId là bắt buộc" });
        }

        const existing = await Location.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ error: "Địa điểm này đã tồn tại" });
        }

        const location = await Location.create({
            name: name.trim(),
            country: country?.trim() || null,
            description: description?.trim() || null,
            status: status ?? true,
            fixedCategoryId: Number(fixedCategoryId),
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

// Lấy location theo id
exports.getLocationById = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) return res.status(404).json({ error: "Không có địa điểm" });
        res.json(location);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Lấy location theo slug fixed category
exports.getLocationsByFixedCategory = async (req, res) => {
    try {
        const { slug } = req.params;

        // Tìm category theo slug và type = fixed
        const category = await Category.findOne({
            where: { slug, type: "fixed" }
        });

        if (!category) {
            return res.status(404).json({ error: "Danh mục cố định không tồn tại" });
        }

        // Lấy danh sách location thuộc fixedCategoryId đó
        const locations = await Location.findAll({
            where: { fixedCategoryId: category.id }
        });

        res.json({
            success: true,
            data: locations,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Cập nhật location
exports.updateLocation = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) return res.status(404).json({ error: "Không có địa điểm" });

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
