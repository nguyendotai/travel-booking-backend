// controllers/tourController.js
const Tour = require("../models/Tour");
const Category = require("../models/Category");
const Location = require("../models/Location");
const Hotel = require("../models/Hotel");
const Destination = require("../models/Destination");
const fs = require("fs");
const path = require("path");

// Lấy tất cả tour
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.findAll({
      include: [
        { model: Category, as: "fixedCategory" },
        { model: Category, as: "optionalCategories", through: { attributes: [] } },
        { model: Location },
        { model: Hotel }
      ]
    });

    res.json({
      success: true,
      data: tours.map(tour => ({
        ...tour.toJSON(),
        statusComputed: tour.tourStatus, // dùng virtual
        salePrice: tour.salePrice        // luôn trả salePrice
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tour theo id
exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findByPk(req.params.id, {
      include: [
        { model: Category, as: "fixedCategory" },
        { model: Category, as: "optionalCategories", through: { attributes: [] } },
        { model: Location },
        { model: Hotel }
      ]
    });

    if (!tour) return res.status(404).json({ error: "Không có tour" });

    res.json({
      ...tour.toJSON(),
      statusComputed: tour.tourStatus,
      salePrice: tour.salePrice
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo tour mới
exports.createTour = async (req, res) => {
  try {
    const { name, description, price, startDate, endDate, capacity, status, fixedCategoryId, location_id, discount = 0, isHotDeal = false } = req.body;

    const hotel_id = req.body.hotel_id ? Number(req.body.hotel_id) : null;

    // Tính duration từ startDate và endDate
    let duration = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (!isNaN(start) && !isNaN(end)) {
        duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // số ngày
      }
    }


    let destinationIds = [];
    let optionalCategoryIds = [];
    try {
      if (req.body.destinationIds) destinationIds = JSON.parse(req.body.destinationIds);
      if (req.body.optionalCategoryIds) optionalCategoryIds = JSON.parse(req.body.optionalCategoryIds);
    } catch (e) {
      return res.status(400).json({ error: "Sai định dạng JSON destinationIds / optionalCategoryIds" });
    }

    const fixedCategory = await Category.findOne({ where: { id: fixedCategoryId, type: "fixed" } });
    if (!fixedCategory) return res.status(400).json({ error: "Danh mục cố định không hợp lệ" });

    let validLocationId = null;
    if (location_id) {
      const location = await Location.findOne({ where: { id: location_id, fixedCategoryId: fixedCategory.id } });
      if (!location) {
        return res.status(400).json({ error: "Location không hợp lệ hoặc không thuộc danh mục cố định" });
      }
      validLocationId = location.id;
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const tour = await Tour.create({
      name,
      slug: Category.slugify(name),
      description,
      price: Number(price),
      startDate,
      endDate,
      duration,
      capacity: Number(capacity),
      image,
      status,
      hotel_id,
      fixedCategoryId: Number(fixedCategoryId),
      location_id: Number(validLocationId),
      discount: Number(discount),
      isHotDeal: Boolean(isHotDeal)
    });

    if (destinationIds.length > 0) {
      const destinations = await Destination.findAll({ where: { id: destinationIds } });
      await tour.setDestinations(destinations);
    }

    if (optionalCategoryIds.length > 0) {
      const optionalCategories = await Category.findAll({
        where: { id: optionalCategoryIds, type: "optional" }
      });
      await tour.addOptionalCategories(optionalCategories);
    }

    res.status(201).json({
      success: true,
      data: { ...tour.toJSON(), salePrice: tour.salePrice }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật tour
exports.updateTour = async (req, res) => {
  try {
    const {
      name, description, price, startDate, endDate, duration,
      capacity, status, optionalCategoryIds, locationId,
      hotel_id, destinationIds, discount, isHotDeal
    } = req.body;

    const tour = await Tour.findByPk(req.params.id, {
      include: [Category, Location, Hotel, Destination]
    });
    if (!tour) return res.status(404).json({ error: "Không có tour" });

    if (req.file) {
      if (tour.image) {
        const oldPath = path.join(__dirname, "..", tour.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      tour.image = `/uploads/${req.file.filename}`;
    }

    if (name) {
      const existing = await Tour.findOne({ where: { name } });
      if (existing && existing.id !== tour.id) {
        return res
          .status(400)
          .json({ success: false, error: "Tên danh mục đã tồn tại" });
      }
      tour.slug = Tour.slugify(name); // cập nhật slug khi đổi name
      tour.name = name;
    }

    await tour.update({
      name, description, price, startDate, endDate, duration,
      capacity, status,
      discount: discount !== undefined ? Number(discount) : tour.discount,
      isHotDeal: isHotDeal !== undefined ? Boolean(isHotDeal) : tour.isHotDeal
    });

    if (optionalCategoryIds !== undefined) {
      const optionalCategories = await Category.findAll({
        where: { id: optionalCategoryIds, type: "optional" }
      });
      await tour.setOptionalCategories(optionalCategories);
    }

    if (locationId) {
      const location = await Location.findOne({
        where: { id: locationId, fixedCategoryId: tour.fixedCategoryId }
      });
      if (!location) {
        return res.status(400).json({ error: "Location không hợp lệ hoặc không thuộc danh mục cố định" });
      }
      tour.locationId = location.id;
      await tour.save();
    }

    if (hotel_id) {
      const hotel = await Hotel.findOne({ where: { id: hotel_id, location_id: tour.locationId } });
      if (!hotel) {
        return res.status(400).json({ error: "Hotel không hợp lệ hoặc không thuộc location đã chọn" });
      }
      await tour.setHotel(hotel);
    }

    if (destinationIds) {
      const destinations = await Destination.findAll({
        where: { id: destinationIds, location_id: tour.locationId }
      });
      await tour.setDestinations(destinations);
    }

    const updatedTour = await Tour.findByPk(tour.id, {
      include: [
        { model: Category, through: { attributes: ["type"] } },
        { model: Location },
        { model: Hotel },
        { model: Destination }
      ]
    });

    res.json({
      ...updatedTour.toJSON(),
      salePrice: updatedTour.salePrice,
      fixedCategories: updatedTour.Categories.filter(c => c.CategoryTour.type === "fixed"),
      optionalCategories: updatedTour.Categories.filter(c => c.CategoryTour.type === "optional")
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa tour
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

// Lấy tour theo category
exports.getToursByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ error: "Không có danh mục" });

    let tours;
    if (category.type === "fixed") {
      tours = await Tour.findAll({
        where: { fixedCategoryId: categoryId },
        include: [{ model: Category, as: "fixedCategory" }]
      });
    } else {
      tours = await Tour.findAll({
        include: [{
          model: Category,
          as: "optionalCategories",
          where: { id: categoryId },
          through: { attributes: [] }
        }]
      });
    }

    res.json(tours.map(tour => ({
      ...tour.toJSON(),
      salePrice: tour.salePrice
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getToursByFixedCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug, type: "fixed" }
    });

    if (!category) {
      return res.status(404).json({ error: "Danh mục cố định không tồn tại" });
    }

    const tours = await Tour.findAll({
      where: { fixedCategoryId: category.id },
      include: [
        { model: Category, as: "fixedCategory" },
        { model: Category, as: "optionalCategories", through: { attributes: [] } },
        { model: Location },
        { model: Hotel }
      ]
    });

    res.json({
      success: true,
      data: tours.map(tour => ({
        ...tour.toJSON(),
        salePrice: tour.salePrice
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getHotDeals = async (req, res) => {
  try {
    const tours = await Tour.findAll({
      where: { isHotDeal: true },
      include: [
        { model: Category, as: "fixedCategory" },
        { model: Category, as: "optionalCategories", through: { attributes: [] } },
        { model: Location },
        { model: Hotel }
      ]
    });

    res.json({
      success: true,
      data: tours.map(tour => ({
        ...tour.toJSON(),
        salePrice: tour.salePrice,       // giá sau giảm
        statusComputed: tour.tourStatus // trạng thái tính toán
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
