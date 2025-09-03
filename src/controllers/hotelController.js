const Hotel = require("../models/Hotel");
const Location = require("../models/Location")

exports.getAllHotel = async (req, res) => {
    const hotel = await Hotel.findAll({
        include: [{ model: Location, attributes: ["id", "name"] }]
    });
    res.json(hotel);
}

exports.createHotel = async (req, res) => {
  try {
    const { name, address, stars, location_id } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Tên khách sạn là bắt buộc" });
    }

    const location = await Location.findByPk(location_id);
    if (!location) {
      return res.status(400).json({ error: "Khách sạn phải thuộc về một Location" });
    }

    const existing = await Hotel.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ error: "Khách sạn này đã tồn tại" });
    }

    const hotel = await Hotel.create({
      name: name.trim(),
      address: address.trim(),
      stars: stars || 3,
      location_id
    });

    res.status(201).json({
      success: true,
      data: hotel,
      message: "Thêm khách sạn thành công"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHotelsByLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const hotels = await Hotel.findAll({ where: { location_id: id } });

    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};