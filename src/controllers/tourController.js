// controllers/tourController.js
const Tour = require("../models/Tour");
const Category = require("../models/Category");
const Location = require("../models/Location");
const Hotel = require("../models/Hotel");
const Destination = require("../models/Destination");
const Departure = require("../models/Departure");
const TourDay = require("../models/TourDay");
const TourDayDestination = require("../models/TourDayDestination");
const TourDestination = require("../models/TourDestination");
const { sequelize } = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

const TOUR_INCLUDE = [
  { model: Category, as: "fixedCategory" },
  { model: Category, as: "optionalCategories", through: { attributes: [] } },
  { model: Location },
  { model: Hotel },
  { model: Departure },
  {
    model: TourDay,
    as: "tourDays",
    include: [
      {
        model: TourDayDestination,
        include: [{ model: Destination }]
      }
    ]
  }
];


// Lấy tất cả tour
exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.findAll({ include: TOUR_INCLUDE });

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
exports.getTourBySlug = async (req, res) => {
  try {
    const tour = await Tour.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: Category, as: "fixedCategory" },
        { model: Category, as: "optionalCategories", through: { attributes: [] } },
        { model: Location },
        { model: Hotel },
        {
          model: TourDay,
          as: "tourDays",  // phải trùng với alias Tour.hasMany(TourDay, {as: "tourDays"})
          include: [
            {
              model: TourDayDestination,
              include: [
                {
                  model: Destination
                }
              ]
            }
          ]
        }
      ]
    });

    if (!tour) return res.status(404).json({ error: "Không có tour" });

    const tourData = tour.toJSON();
    tourData.tourDays = tourData.tourDays.map(day => ({
      ...day,
      destinationIds: day.TourDayDestinations.map(td => td.Destination.id)
    }));

    res.json({
      success: true,
      data: {
        ...tourData,
        statusComputed: tour.tourStatus,
        salePrice: tour.salePrice
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo tour mới
exports.createTour = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      name,
      description,
      price,
      startDate,
      endDate,
      capacity,
      status,
      fixedCategoryId,
      location_id,
      hotel_id,
      discount = 0,
      isHotDeal = false,
      departureId,
    } = req.body;

    // --- Parse JSON từ frontend (tránh trường hợp bị stringify) ---
    let optionalCategoryIds = [];
    let destinationIds = [];
    let daysData = [];

    if (req.body.optionalCategoryIds) {
      try {
        optionalCategoryIds = JSON.parse(req.body.optionalCategoryIds);
      } catch {
        optionalCategoryIds = Array.isArray(req.body.optionalCategoryIds)
          ? req.body.optionalCategoryIds
          : [];
      }
    }

    if (req.body.destinationIds) {
      try {
        destinationIds = JSON.parse(req.body.destinationIds);
      } catch {
        destinationIds = Array.isArray(req.body.destinationIds)
          ? req.body.destinationIds
          : [];
      }
    }

    if (req.body.days) {
      try {
        daysData = JSON.parse(req.body.days);
      } catch {
        return res.status(400).json({ error: "Days format invalid" });
      }
    }

    // --- Kiểm tra danh mục cố định ---
    const fixedCategory = await Category.findOne({
      where: { id: fixedCategoryId, type: "fixed" },
    });
    if (!fixedCategory)
      return res.status(400).json({ error: "Danh mục cố định không hợp lệ" });

    // --- Kiểm tra location ---
    let validLocationId = null;
    if (location_id) {
      const location = await Location.findOne({
        where: { id: location_id, fixedCategoryId },
      });
      if (!location)
        return res.status(400).json({ error: "Location không hợp lệ" });
      validLocationId = location.id;
    }

    // --- Kiểm tra departure ---
    let validDepartureId = null;
    if (departureId) {
      const departure = await Departure.findByPk(departureId);
      if (!departure)
        return res.status(400).json({ error: "Departure không hợp lệ" });
      validDepartureId = departure.id;
    }

    // --- Tính số ngày ---
    let duration = 0;
    if (startDate && endDate) {
      duration = Math.ceil(
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
      );
    }

    // --- Tạo tour ---
    const tour = await Tour.create(
      {
        name,
        slug: Tour.slugify(name),
        description,
        price: Number(price),
        startDate,
        endDate,
        duration,
        capacity: Number(capacity),
        image: req.file ? `/uploads/${req.file.filename}` : null,
        status,
        hotel_id: hotel_id ? Number(hotel_id) : null,
        fixedCategoryId,
        location_id: validLocationId,
        discount: Number(discount),
        isHotDeal: Boolean(isHotDeal),
        departureId: validDepartureId,
      },
      { transaction: t }
    );

    // --- Gán Destination (N-N) ---
    if (Array.isArray(destinationIds) && destinationIds.length > 0) {
      const dests = await Destination.findAll({
        where: { id: destinationIds },
      });
      await tour.setDestinations(dests, { transaction: t });
      console.log("✅ Destinations linked:", dests.map((d) => d.id));
    }

    // --- Gán Optional Category (N-N) ---
    if (Array.isArray(optionalCategoryIds) && optionalCategoryIds.length > 0) {
      const optionalCats = await Category.findAll({
        where: { id: optionalCategoryIds, type: "optional" },
      });
      await tour.addOptionalCategories(optionalCats, { transaction: t });
      console.log("✅ Optional categories linked:", optionalCats.map((c) => c.id));
    }

    // --- Tạo TourDay + TourDayDestination ---
    if (Array.isArray(daysData) && daysData.length > 0) {
      for (const day of daysData) {
        const tourDay = await TourDay.create(
          {
            tourId: tour.id,
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
          },
          { transaction: t }
        );

        if (Array.isArray(day.destinationIds) && day.destinationIds.length > 0) {
          for (let i = 0; i < day.destinationIds.length; i++) {
            await TourDayDestination.create(
              {
                tourDayId: tourDay.id,
                destinationId: day.destinationIds[i],
                order: i + 1,
              },
              { transaction: t }
            );
          }
        }
      }
    }

    await t.commit();

    res.status(201).json({
      success: true,
      data: { ...tour.toJSON(), salePrice: tour.salePrice },
    });
  } catch (err) {
    await t.rollback();
    console.error("❌ Create tour error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật tour
exports.updateTour = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      name, description, price, startDate, endDate, capacity, status,
      fixedCategoryId, locationId, hotel_id, discount, isHotDeal,
      optionalCategoryIds, destinationIds, days
    } = req.body;

    // Tìm tour theo slug
    const tour = await Tour.findOne({ where: { slug: req.params.slug } });
    if (!tour) return res.status(404).json({ error: "Tour không tồn tại" });

    // Update thông tin cơ bản
    if (name) {
      tour.name = name;
      tour.slug = Tour.slugify(name); // nếu muốn update slug theo name mới
    }
    tour.description = description ?? tour.description;
    tour.price = price !== undefined ? Number(price) : tour.price;
    tour.startDate = startDate ?? tour.startDate;
    tour.endDate = endDate ?? tour.endDate;
    tour.duration = (startDate && endDate) ? Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) : tour.duration;
    tour.capacity = capacity !== undefined ? Number(capacity) : tour.capacity;
    tour.status = status ?? tour.status;
    tour.discount = discount !== undefined ? Number(discount) : tour.discount;
    if (isHotDeal !== undefined) {
      tour.isHotDeal = isHotDeal === "true" || isHotDeal === true;
    }
    tour.fixedCategoryId = fixedCategoryId ?? tour.fixedCategoryId;
    tour.location_id = locationId ?? tour.location_id;
    tour.hotel_id = hotel_id ?? tour.hotel_id;

    if (req.file) {
      tour.image = `/uploads/${req.file.filename}`;
    }

    await tour.save({ transaction: t });

    // Update optional categories
    if (optionalCategoryIds && Array.isArray(optionalCategoryIds)) {
      const optionalCats = await Category.findAll({ where: { id: optionalCategoryIds, type: "optional" } });
      await tour.setOptionalCategories(optionalCats, { transaction: t });
    }

    // Update destinations
    if (destinationIds && Array.isArray(destinationIds)) {
      const dests = await Destination.findAll({ where: { id: destinationIds } });
      await tour.setDestinations(dests, { transaction: t });
    }

    // Update TourDay
    if (days && Array.isArray(days)) {
      const oldDays = await TourDay.findAll({ where: { tourId: tour.id } });
      for (const oldDay of oldDays) {
        await TourDayDestination.destroy({ where: { tourDayId: oldDay.id }, transaction: t });
      }
      await TourDay.destroy({ where: { tourId: tour.id }, transaction: t });

      for (const day of days) {
        const tourDay = await TourDay.create({
          tourId: tour.id,
          dayNumber: day.dayNumber,
          title: day.title,
          description: day.description
        }, { transaction: t });

        if (day.destinationIds && Array.isArray(day.destinationIds)) {
          for (let i = 0; i < day.destinationIds.length; i++) {
            await TourDayDestination.create({
              tourDayId: tourDay.id,
              destinationId: day.destinationIds[i],
              order: i + 1
            }, { transaction: t });
          }
        }
      }
    }

    await t.commit();

    res.json({
      success: true,
      data: { ...tour.toJSON(), salePrice: tour.salePrice }
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
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
      include: TOUR_INCLUDE
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
      include: TOUR_INCLUDE
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

exports.searchTours = async (req, res) => {
  try {
    const { destination, date, minPrice, maxPrice } = req.query;

    let whereClause = {};

    // Filter theo date
    if (date) {
      whereClause.startDate = { [Op.gte]: new Date(date) };
    }

    // Filter theo price
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = Number(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = Number(maxPrice);
    }

    // Filter theo destination
    let locationFilter = {};
    if (destination) {
      const location = await Location.findOne({
        where: {
          name: { [Op.like]: `%${destination}%` }  // tìm gần đúng
        }
      });
      if (!location) {
        // Nếu không tìm thấy location nào, trả về rỗng
        return res.json({ success: true, data: [] });
      }
      locationFilter = { location_id: location.id };
    }

    const tours = await Tour.findAll({
      where: { ...whereClause, ...locationFilter },
      include: TOUR_INCLUDE
    });

    res.json({
      success: true,
      data: tours.map(tour => ({
        ...tour.toJSON(),
        salePrice: tour.salePrice
      }))
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getToursByDestination = async (req, res) => {
  try {
    const { destinationId } = req.params;

    // Kiểm tra destination có tồn tại
    const destination = await Destination.findByPk(destinationId);
    if (!destination) {
      return res.status(404).json({ error: "Destination không tồn tại" });
    }

    // Lấy các tour có liên kết với destinationId qua bảng trung gian
    const tours = await Tour.findAll({
      include: [
        ...TOUR_INCLUDE,
        {
          model: Destination,
          as: "destinations",
          through: { attributes: [] }, // ẩn cột trung gian
          where: { id: destinationId }, // lọc theo id
        },
      ],
    });

    res.json({
      success: true,
      data: tours.map((tour) => ({
        ...tour.toJSON(),
        salePrice: tour.salePrice,
        statusComputed: tour.tourStatus,
      })),
    });
  } catch (err) {
    console.error("getToursByDestination error:", err);
    res.status(500).json({ error: err.message });
  }
};
