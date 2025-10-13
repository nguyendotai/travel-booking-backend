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
const Departure = require("./Departure");
const TourDay = require("../models/TourDay");
const TourDayDestination = require("../models/TourDayDestination");

// Hotel - Location (N-N)
Hotel.belongsToMany(Location, {
  through: "hotellocations",
  foreignKey: "hotel_id",
  otherKey: "location_id",
  as: "locations",
});
Location.belongsToMany(Hotel, {
  through: "hotellocations",
  foreignKey: "location_id",
  otherKey: "hotel_id",
  as: "hotels",
});

// Tour - Location (1-N, SET NULL)
Tour.belongsTo(Location, {
  foreignKey: { name: "location_id", allowNull: true },
  onDelete: "SET NULL",
});
Location.hasMany(Tour, { foreignKey: "location_id" });

// Destination - Location (1-N, SET NULL)
Destination.belongsTo(Location, {
  foreignKey: { name: "location_id", allowNull: true },
  onDelete: "SET NULL",
});
Location.hasMany(Destination, { foreignKey: "location_id" });

// Location - Category (1-N, SET NULL)
Location.belongsTo(Category, {
  foreignKey: { name: "fixedCategoryId", allowNull: true },
  as: "fixedCategory",
  onDelete: "SET NULL",
});
Category.hasMany(Location, { foreignKey: "fixedCategoryId", as: "locations" });

// Tour - Hotel (1-N, SET NULL)
Tour.belongsTo(Hotel, {
  foreignKey: { name: "hotel_id", allowNull: true },
  onDelete: "SET NULL",
});
Hotel.hasMany(Tour, { foreignKey: "hotel_id" });

// Tour - Fixed Category (1-N, SET NULL)
Tour.belongsTo(Category, {
  foreignKey: { name: "fixedCategoryId", allowNull: true },
  as: "fixedCategory",
  onDelete: "SET NULL",
});
Category.hasMany(Tour, {
  foreignKey: "fixedCategoryId",
  as: "toursWithFixedCategory",
});

// Tour - Optional Category (N-N)
Tour.belongsToMany(Category, {
  through: TourCategory,
  foreignKey: "tour_id",
  as: "optionalCategories",
});
Category.belongsToMany(Tour, {
  through: TourCategory,
  foreignKey: "category_id",
});

// Tour - Destination (N-N)
Tour.belongsToMany(Destination, {
  through: TourDestination,
  foreignKey: "tour_id",
  otherKey: "destination_id",
  as: "destinations",
});

Destination.belongsToMany(Tour, {
  through: TourDestination,
  foreignKey: "destination_id",
  otherKey: "tour_id",
  as: "tours",
});



// Departure - Tour (1-N, SET NULL)
Tour.belongsTo(Departure, {
  foreignKey: { name: "departureId", allowNull: true },
  onDelete: "SET NULL",
});
Departure.hasMany(Tour, { foreignKey: "departureId" });

TourDay.belongsTo(Tour, { foreignKey: "tourId", onDelete: "CASCADE" });
Tour.hasMany(TourDay, { as: "tourDays", foreignKey: "tourId" });

TourDayDestination.belongsTo(TourDay, { foreignKey: "tourDayId", onDelete: "CASCADE" });
TourDay.hasMany(TourDayDestination, { foreignKey: "tourDayId" });

TourDayDestination.belongsTo(Destination, { foreignKey: "destinationId", onDelete: "CASCADE" });
Destination.hasMany(TourDayDestination, { foreignKey: "destinationId" });

// Booking - User (1-N, SET NULL để giữ lịch sử booking ngay cả khi user xóa)
Booking.belongsTo(User, {
  foreignKey: { name: "user_id", allowNull: true },
  onDelete: "SET NULL",
});
User.hasMany(Booking, { foreignKey: "user_id" });

// Booking - Tour (1-N, SET NULL để giữ lịch sử booking ngay cả khi tour xóa)
Booking.belongsTo(Tour, {
  foreignKey: { name: "tour_id", allowNull: true },
  onDelete: "SET NULL",
});
Tour.hasMany(Booking, { foreignKey: "tour_id" });

// Payment - Booking (1-1, SET NULL)
Payment.belongsTo(Booking, {
  foreignKey: { name: "booking_id", allowNull: true },
  onDelete: "SET NULL",
});
Booking.hasOne(Payment, { foreignKey: "booking_id" });

// Review - User (1-N, SET NULL)
Review.belongsTo(User, {
  foreignKey: { name: "user_id", allowNull: true },
  onDelete: "SET NULL",
});
User.hasMany(Review, { foreignKey: "user_id" });

// Review - Tour (1-N, SET NULL)
Review.belongsTo(Tour, {
  foreignKey: { name: "tour_id", allowNull: true },
  onDelete: "SET NULL",
});
Tour.hasMany(Review, { foreignKey: "tour_id" });

// Wishlist (N-N, thường giữ nguyên, không cascade)
User.belongsToMany(Tour, { through: Wishlist, foreignKey: "user_id" });
Tour.belongsToMany(User, { through: Wishlist, foreignKey: "tour_id" });

// Invoice - Booking (1-1, SET NULL)
Invoice.belongsTo(Booking, {
  foreignKey: { name: "booking_id", allowNull: true },
  onDelete: "SET NULL",
});
Booking.hasOne(Invoice, { foreignKey: "booking_id" });

// Notification - User (1-N, SET NULL)
Notification.belongsTo(User, {
  foreignKey: { name: "user_id", allowNull: true },
  onDelete: "SET NULL",
});
User.hasMany(Notification, { foreignKey: "user_id" });

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
  Departure,
};
