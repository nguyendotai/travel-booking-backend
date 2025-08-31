const Location = require("../models/Location");

exports.createLocation = async (req, res) => {
    try {
        const { name, country, description, type, startDate, endDate } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({ error: "Tên địa điểm là bắt buộc" });
        }

        const existing = await Location.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ error: "Địa điểm này đã tồn tại" });
        }

        const location = await Location.create({
            name: name.trim(),
            country: country.trim(),
            description: description.trim(),
            startDate: startDate || null,
            endDate: endDate || null
        });

        res.status(201).json({
            success: true,
            data: location,
            message: "Tạo địa điểm thành công"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};