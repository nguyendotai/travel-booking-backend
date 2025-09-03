const Destination = require("../models/Destination");
const Location = require("../models/Location");

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

    const destination = await Destination.create({
      name: name.trim(),
      description: description?.trim() || "",
      location_id
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
