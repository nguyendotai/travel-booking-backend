const Category = require("../models/Category");

exports.getAllCategory = async (req, res) => {
    const category = await Category.findAll();
    res.json(category);
}

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Không có danh mục" });
        }
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.createCategory = async (req, res) => {
    try {
        const { name,description , type, startDate, endDate } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Tên danh mục là bắt buộc" });
        }

        const existing = await Category.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ error: "Danh mục này đã tồn tại" });
        }

        const category = await Category.create({
            name: name.trim(),
            description: description.trim(),
            type: type || "fixed",
            startDate: startDate || null,
            endDate: endDate || null
        });

        res.status(201).json({
            success: true,
            data: category,
            message: "Tạo danh mục thành công"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Không có danh mục" });
        }

        if (req.body.name) {
            const existing = await Category.findOne({ where: { name: req.body.name } });
            if (existing && existing.id !== category.id) {
                return res.status(400).json({ error: "Tên danh mục đã tồn tại" });
            }
        }

        await category.update(req.body);
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Không có danh mục" });
        }

        // Kiểm tra nếu category đã liên kết tour
        const tours = await category.getTours();
        if (tours.length > 0) {
            return res.status(400).json({ error: "Danh mục này đang được dùng cho Tour, không thể xoá" });
        }

        await category.destroy();
        res.json({ message: "Xóa danh mục thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
