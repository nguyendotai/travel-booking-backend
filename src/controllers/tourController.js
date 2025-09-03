// controllers/tourController.js
const Tour = require("../models/Tour");
const Category = require("../models/Category");
const Location = require("../models/Location")
const Hotel = require("../models/Hotel")

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.findAll({
      include: [{ model: Category }, { model: Location }, { model: Hotel }
      ] // load cả danh mục
    });
    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id, { include: Category });
    if (!tour) return res.status(404).json({ error: "Không có tour" });
    res.json(tour);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTour = async (req, res) => {
  try {
    const {
      name, description, price, startDate, endDate,
      duration, capacity, status,
      fixedCategoryId, optionalCategoryIds,
      locationIds, hotelIds
    } = req.body;

    const fixedCategory = await Category.findOne({
      where: { id: fixedCategoryId, type: "fixed" }
    });
    if (!fixedCategory) {
      return res.status(400).json({ error: "Danh mục cố định không hợp lệ" });
    }

    let validLocationIds = [];
    if (locationIds && locationIds.length > 0) {
      const locations = await Location.findAll({
        where: {
          id: locationIds,
          fixedCategoryId: fixedCategory.id
        }
      });

      if (locations.length !== locationIds.length) {
        return res.status(400).json({ error: "Một hoặc nhiều location không thuộc danh mục cố định" });
      }

      validLocationIds = locations.map(l => l.id);
    }

    let validHotelIds = [];
    if (hotelIds && hotelIds.length > 0) {
      const hotels = await Hotel.findAll({
        where: {
          id: hotelIds,
          location_id: validLocationIds
        }
      });

      if (hotels.length !== hotelIds.length) {
        return res.status(400).json({ error: "Một hoặc nhiều hotel không thuộc location được chọn" });
      }

      validHotelIds = hotels.map(h => h.id);
    }

    let validDestinationIds = [];
    if (destinationIds && destinationIds.length > 0) {
      const destinations = await Destination.findAll({
        where: {
          id: destinationIds,
          location_id: validLocationIds  
        }
      });

      if (destinations.length !== destinationIds.length) {
        return res.status(400).json({ error: "Một hoặc nhiều destination không thuộc location được chọn" });
      }

      validDestinationIds = destinations.map(d => d.id);
    }

    const tour = await Tour.create({
      name,
      description,
      price,
      startDate,
      endDate,
      duration,
      capacity,
      status,
      fixedCategoryId: fixedCategory.id
    });

    await tour.addCategory(fixedCategory, { through: { type: "fixed" } });
    if (optionalCategoryIds && optionalCategoryIds.length > 0) {
      const optionalCategories = await Category.findAll({
        where: { id: optionalCategoryIds, type: "optional" }
      });
      for (const cat of optionalCategories) {
        await tour.addCategory(cat, { through: { type: "optional" } });
      }
    }

    if (validDestinationIds.length > 0) {
      await tour.setDestinations(validDestinationIds);
    }
    if (validLocationIds.length > 0) await tour.setLocations(validLocationIds);
    if (validHotelIds.length > 0) await tour.setHotels(validHotelIds);

    // 7. Lấy lại tour với quan hệ đầy đủ
    const newTour = await Tour.findByPk(tour.id, {
      include: [
        { model: Category, through: { attributes: ["type"] } },
        { model: Location },
        { model: Hotel }
      ]
    });

    res.status(201).json({
      ...newTour.toJSON(),
      fixedCategories: newTour.Categories.filter(c => c.CategoryTour.type === "fixed"),
      optionalCategories: newTour.Categories.filter(c => c.CategoryTour.type === "optional")
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.updateTour = async (req, res) => {
  try {
    const { name, description, price, startDate, endDate, duration, capacity, status, categoryIds } = req.body;
    const tour = await Tour.findByPk(req.params.id, { include: Category });

    if (!tour) return res.status(404).json({ error: "Không có tour" });

    // update thông tin tour
    await tour.update({ name, description, price, startDate, endDate, duration, capacity, status });

    // xử lý category nếu có truyền lên
    if (categoryIds !== undefined) {
      // lấy tất cả category gửi lên
      const categories = await Category.findAll({ where: { id: categoryIds } });

      // giữ lại category fixed cũ
      const fixedCategories = tour.Categories.filter(c => c.type === "fixed");

      // gộp fixed cũ + categories mới (nếu có)
      const allCategories = [...fixedCategories, ...categories];

      await tour.setCategories(allCategories);
    }

    // trả về tour sau update
    const updatedTour = await Tour.findByPk(tour.id, { include: Category });
    res.json(updatedTour);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id);
    if (!tour) return res.status(404).json({ error: "Không có tour" });

    await tour.destroy();
    res.json({ message: "Xóa tour thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getToursByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const tours = await Tour.findAll({
      include: [
        {
          model: Category,
          where: { id: categoryId },
          through: { attributes: [] }
        }
      ]
    });

    res.json(tours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
