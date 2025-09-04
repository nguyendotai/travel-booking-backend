const Destination = require("../models/Destination");
const Location = require("../models/Location");
const fs = require("fs");
const path = require("path");

// Lấy tất cả điểm đến
exports.getAllDestination = async (req, res) => {
  try {
    const destinations = await Destination.findAll({
      include: [{ model: Location, attributes: ["id", "name"] }]
    });
    res.json(destinations);
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

    res.json(destination);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Thêm điểm đến mới
exports.createDestination = async (req, res) => {
  try {
    const { name, description, location_id } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Tên điểm đến là bắt buộc" });
    }

    const location = await Location.findByPk(location_id);
    if (!location) {
      return res.status(400).json({ error: "Location không tồn tại" });
    }

    // Nếu có file upload thì lấy filename
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`; // đường dẫn ảnh
    }

    const destination = await Destination.create({
      name: name.trim(),
      description: description?.trim() || "",
      location_id,
      image,
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

// Lấy điểm đến theo location
exports.getDestinationsByLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const destinations = await Destination.findAll({ where: { location_id: id } });

    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Cập nhật điểm đến
exports.updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, location_id } = req.body;

    const destination = await Destination.findByPk(id);
    if (!destination) {
      return res.status(404).json({ error: "Destination không tồn tại" });
    }

    if (location_id) {
      const location = await Location.findByPk(location_id);
      if (!location) {
        return res.status(400).json({ error: "Location không tồn tại" });
      }
    }

    // Nếu có upload ảnh mới
    if (req.file) {
      // Xóa ảnh cũ nếu tồn tại
      if (destination.image) {
        const oldPath = path.join(__dirname, "..", destination.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      destination.image = `/uploads/${req.file.filename}`;
    }

    destination.name = name || destination.name;
    destination.description = description || destination.description;
    destination.location_id = location_id || destination.location_id;

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

    // Xóa ảnh trong thư mục nếu có
    if (destination.image) {
      const oldPath = path.join(__dirname, "..", destination.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await destination.destroy();

    res.json({
      success: true,
      message: "Xóa điểm đến thành công",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
