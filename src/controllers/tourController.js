// controllers/tourController.js
const Tour = require("../models/Tour");
const Category = require("../models/Category");
const Location = require("../models/Location")

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.findAll({
      include: [{ model: Category }, { model: Location }
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
      fixedCategoryId, optionalCategoryIds, locationIds
    } = req.body;

    // Kiểm tra danh mục cố định
    const fixedCategory = await Category.findOne({
      where: { id: fixedCategoryId, type: "fixed" }
    });
    if (!fixedCategory) {
      return res.status(400).json({ error: "Danh mục cố định không hợp lệ" });
    }

    // Tạo tour
    const tour = await Tour.create({
      name,
      description,
      price,
      startDate,
      endDate,
      duration,
      capacity,
      status,
      fixedCategoryId: fixedCategory.id   // thêm dòng này
    });


    // Gắn danh mục cố định
    await tour.addCategory(fixedCategory, { through: { type: 'fixed' } });

    // Nếu có danh mục tùy chọn
    if (optionalCategoryIds && optionalCategoryIds.length > 0) {
      const optionalCategories = await Category.findAll({
        where: { id: optionalCategoryIds, type: "optional" }
      });

      // gắn từng category với type là 'optional'
      for (const cat of optionalCategories) {
        await tour.addCategory(cat, { through: { type: 'optional' } });
      }
    }

    if (locationIds && locationIds.length > 0) {
      await tour.setLocations(locationIds);
    }

    // Lấy lại tour kèm danh mục
    const newTour = await Tour.findByPk(tour.id, {
      include: [
        { model: Category, through: { attributes: ['type'] } },
        { model: Location }
      ]
    });

    res.status(201).json({
      ...newTour.toJSON(),
      fixedCategories: newTour.Categories.filter(c => c.CategoryTour.type === 'fixed'),
      optionalCategories: newTour.Categories.filter(c => c.CategoryTour.type === 'optional')
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
