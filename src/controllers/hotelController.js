const Hotel = require("../models/Hotel")
const Location = require("../models/Location");

exports.getAllHotel = async (req, res) => {
  try {
    const hotels = await Hotel.findAll({
      include: [{ model: Location, as: "locations", attributes: ["id", "name"] }]
    });
    res.json({ success: true, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createHotel = async (req, res) => {
  try {
    const { name, address, stars, locationIds } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, error: "Tên khách sạn là bắt buộc" });
    }

    const existing = await Hotel.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ success: false, error: "Khách sạn này đã tồn tại" });
    }

    const hotel = await Hotel.create({
      name: name.trim(),
      address: address?.trim() || null,
      stars: stars || 3,
    });

    if (locationIds && Array.isArray(locationIds)) {
      const locations = await Location.findAll({ where: { id: locationIds } });
      if (locations.length > 0) {
        await hotel.setLocations(locations); // Sequelize auto thêm vào bảng trung gian
      }
    }

    // Quan trọng: include phải có "as"
    const newHotel = await Hotel.findByPk(hotel.id, {
      include: [{ model: Location, as: "locations", attributes: ["id", "name"] }],
    });

    res.status(201).json({
      success: true,
      data: newHotel,
      message: "Thêm khách sạn thành công",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try{
    const hotel = await Hotel.findByPk(req.params.id);
    if(!hotel) return res.status(404).json({ error: "Không có khách sạn" });

    await hotel.destroy();
    res.json({ message: "Xóa khách sạn thành công" });
  }catch(err){
    res.status(500).json({ err: err.message });
  }
}

exports.getHotelsByLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const hotels = await Hotel.findAll({
      include: [
        {
          model: Location,
          as: "locations",
          where: { id }, // lọc theo locationId
          through: { attributes: [] }, // bỏ cột trung gian
          attributes: ["id", "name"],
        },
      ],
    });
    res.json({ success: true, data: hotels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
