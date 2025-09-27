const Destination = require("../models/Destination");
const Location = require("../models/Location");
const Category = require("../models/Category");
const fs = require("fs");
const path = require("path");

// Lấy tất cả điểm đến
exports.getAllDestination = async (req, res) => {
  try {
    const destinations = await Destination.findAll({
      include: [{ model: Location, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });

    const result = destinations.map((d) => {
      const json = d.toJSON();
      return {
        ...json,
        status: json.status ? 1 : 0,
      };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy destination theo id
exports.getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findByPk(id, {
      include: [{ model: Location, attributes: ["id", "name"] }],
    });

    if (!destination) {
      return res.status(404).json({ error: "Destination không tồn tại" });
    }

    res.json({ success: true, data: destination });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDestinationsByFixedCategory = async (req, res) => {
  try {
    const { type } = req.params; // "domestic" | "international"

    // Map từ param sang Category.name trong DB
    const categoryMap = {
      domestic: "du lịch trong nước",
      international: "du lịch quốc tế",
    };

    const categoryName = categoryMap[type];
    if (!categoryName) {
      return res
        .status(400)
        .json({ success: false, error: "Loại category không hợp lệ" });
    }

    const destinations = await Destination.findAll({
      include: [
        {
          model: Location,
          attributes: ["id", "name"],
          include: [
            {
              model: Category,
              as: "fixedCategory",
              attributes: ["id", "name", "type"],
              where: { type: "fixed", name: categoryName },
              required: true,
            },
          ],
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: destinations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Thêm điểm đến mới
exports.createDestination = async (req, res) => {
  try {
    const { name, description, location_id, status } = req.body;

    if (!name || !location_id) {
      return res
        .status(400)
        .json({ error: "Tên điểm đến và Location là bắt buộc" });
    }

    const location = await Location.findByPk(location_id);
    if (!location) {
      return res.status(400).json({ error: "Location không tồn tại" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const destination = await Destination.create({
      name: name.trim(),
      description: description?.trim() || "",
      location_id,
      image,
      status: status ?? true,
      featured: req.body.featured ?? false,
    });

    res.status(201).json({
      success: true,
      data: destination,
      message: "Thêm điểm đến thành công",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật điểm đến
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location_id, status, featured } = req.body;

    const destination = await Destination.findByPk(id);
    if (!destination) {
      return res.status(404).json({ error: "Destination không tồn tại" });
    }

    if (location_id) {
      const location = await Location.findByPk(location_id);
      if (!location) {
        return res.status(400).json({ error: "Location không tồn tại" });
      }
      destination.location_id = location_id;
    }

    if (req.file) {
      // Xóa ảnh cũ
      if (destination.image) {
        const oldPath = path.join(__dirname, "..", destination.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      destination.image = `/uploads/${req.file.filename}`;
    }

    destination.name = name?.trim() || destination.name;
    destination.description = description?.trim() || destination.description;

    if (status !== undefined) {
      destination.status = status; // cập nhật status nếu có gửi lên
    }

    if (featured !== undefined) {
      destination.featured = featured;
    }


    await destination.save();

    res.json({
      success: true,
      data: destination,
      message: "Cập nhật điểm đến thành công",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa điểm đến
exports.deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const destination = await Destination.findByPk(id);

    if (!destination) {
      return res.status(404).json({ error: "Destination không tồn tại" });
    }

    if (destination.image) {
      const oldPath = path.join(__dirname, "..", destination.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await destination.destroy();

    res.json({ success: true, message: "Xóa điểm đến thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getDestinationsByLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const destinations = await Destination.findAll({
      where: { location_id: id }
    });

    res.json({ success: true, data: destinations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Lấy danh sách điểm đến nổi bật theo category (Trong nước / Quốc tế)
exports.getFeaturedDestinations = async (req, res) => {
  try {
    const { categoryId } = req.query;
    // categoryId = 1 (trong nước) | 2 (quốc tế)

    const destinations = await Destination.findAll({
      where: { featured: 1, status: 1 },
      include: [
        {
          model: Location,
          attributes: ["id", "name"],
          include: [
            {
              model: Category,
              as: "fixedCategory",
              attributes: ["id", "name"],
              where: categoryId ? { id: categoryId } : undefined,
              required: true, // ⚡ ép INNER JOIN
            },
          ],
          required: true, // ⚡ ép phải có Location
        },
      ],
      order: [["createdAt", "DESC"]],
    });


    res.json({ success: true, data: destinations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


