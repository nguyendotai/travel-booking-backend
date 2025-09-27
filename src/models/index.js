const { Sequelize } = require("sequelize");
const sequelize = require("../config/db");

// Require all models
const User = require("./User");
const Category = require("./Category");
const Location = require("./Location");
const Hotel = require("./Hotel");
const HotelLocation = require("./HotelLocation");
const Destination = require("./Destination");
const Tour = require("./Tour");
const TourCategory = require("./TourCategory");
const TourDestination = require("./TourDestination");
const Booking = require("./Booking");
const Payment = require("./Payment");
const Review = require("./Review");
const Wishlist = require("./Wishlist");
const Invoice = require("./Invoice");
const Notification = require("./Notification");

// associations.js (hoặc ngay trong model index)
Hotel.belongsToMany(Location, {
  through: "hotellocations",
  foreignKey: "hotel_id",
  otherKey: "location_id",
  as: "locations"   // <- alias bắt buộc
});

Location.belongsToMany(Hotel, {
  through: "hotellocations",
  foreignKey: "location_id",
  otherKey: "hotel_id",
  as: "hotels"
});

Tour.belongsTo(Location, { foreignKey: "location_id" });
Location.hasMany(Tour, { foreignKey: "location_id" });


Location.hasMany(Destination, { foreignKey: "location_id" });
Destination.belongsTo(Location, { foreignKey: "location_id" });

Location.belongsTo(Category, { foreignKey: "fixedCategoryId", as: "fixedCategory" });
Category.hasMany(Location, { foreignKey: "fixedCategoryId", as: "locations" });

Tour.belongsTo(Hotel, { foreignKey: "hotel_id" });
Hotel.hasMany(Tour, { foreignKey: "hotel_id" });

// Tour - Fixed Category (1-1)
Tour.belongsTo(Category, { foreignKey: "fixedCategoryId", as: "fixedCategory" });
Category.hasMany(Tour, { foreignKey: "fixedCategoryId", as: "toursWithFixedCategory" });

// Tour - Optional Category (N-N)
Tour.belongsToMany(Category, { through: TourCategory, foreignKey: "tour_id", as: "optionalCategories" });
Category.belongsToMany(Tour, { through: TourCategory, foreignKey: "category_id" });

// Tour - Destination (N-N)
Tour.belongsToMany(Destination, { through: TourDestination, foreignKey: "tour_id" });
Destination.belongsToMany(Tour, { through: TourDestination, foreignKey: "destination_id" });

// Booking
User.hasMany(Booking, { foreignKey: "user_id" });
Booking.belongsTo(User, { foreignKey: "user_id" });
Tour.hasMany(Booking, { foreignKey: "tour_id" });
Booking.belongsTo(Tour, { foreignKey: "tour_id" });

// Payment
Booking.hasOne(Payment, { foreignKey: "booking_id" });
Payment.belongsTo(Booking, { foreignKey: "booking_id" });

// Review
User.hasMany(Review, { foreignKey: "user_id" });
Review.belongsTo(User, { foreignKey: "user_id" });
Tour.hasMany(Review, { foreignKey: "tour_id" });
Review.belongsTo(Tour, { foreignKey: "tour_id" });

// Wishlist
User.belongsToMany(Tour, { through: Wishlist, foreignKey: "user_id" });
Tour.belongsToMany(User, { through: Wishlist, foreignKey: "tour_id" });

// Invoice
Booking.hasOne(Invoice, { foreignKey: "booking_id" });
Invoice.belongsTo(Booking, { foreignKey: "booking_id" });

// Notification
User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

module.exports = {
  sequelize,
  User,
  Category,
  Location,
  Hotel,
  Destination,
  Tour,
  TourCategory,
  TourDestination,
  Booking,
  Payment,
  Review,
  Wishlist,
  Invoice,
  Notification,
};
