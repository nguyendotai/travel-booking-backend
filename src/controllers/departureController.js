const Departure = require("../models/Departure");

exports.getAllDeparture = async (req, res) => {
    try {
        const departures = await Departure.findAll();
        res.json({ success: true, data: departures });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createDeparture = async (req, res) => {
    try {
        const { name, province } = req.body;

        if (!name || !province) {
            return res.status(400).json("Tên điểm khởi hành và tỉnh là bắt buộc!");
        }

        const existingDeparture = await Departure.findOne({ where: { name: name.trim() } });
        if (existingDeparture) {
            return res.status(400).json("Tên điểm khởi hành đã tồn tại!");
        }

        const departure = await Departure.create({
            name: name.trim(),
            province: province.trim(),
        });

        res.status(201).json({
            success: true,
            data: departure,
            message: "Thêm điểm khởi hành thành công",
        });
    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};
