const { Sequelize } = require("sequelize");
const sequelize = require("../config/db");

// Require tất cả model
const User = require("./User");
const Tour = require("./Tour");
const Category = require("./Category");
const CategoryTour = require("./CategoryTour");
const LocationTour = require("./LocationTour");
const HotelTour = require("./HotelTour")
const Destination = require("./Destination")
const Booking = require("./Booking");
const Payment = require("./Payment");
const Review = require("./Review");
const Wishlist = require("./Wishlist");    
const Notification = require("./Notification");
const Invoice = require("./Invoice");
const Complaint = require("./Complaint");
const AdminLog = require("./AdminLog");
const Location = require("./Location");
const TourSchedule = require("./TourSchedule");
const Guide = require("./Guide");
const TourGuide = require("./TourGuide");
const Document = require("./Document");
const Promotion = require("./Promotion");
const Transport = require("./Transport");
const Hotel = require("./Hotel");
const Room = require("./Room");

// --- Quan hệ ---
// User
User.hasMany(Booking);
Booking.belongsTo(User);

User.hasMany(Review);
Review.belongsTo(User);

User.hasMany(Wishlist);
Wishlist.belongsTo(User);

User.hasMany(Payment);
Payment.belongsTo(User);

User.hasMany(Notification);
Notification.belongsTo(User);

User.hasMany(Invoice);
Invoice.belongsTo(User);

User.hasMany(Complaint);
Complaint.belongsTo(User);

User.hasMany(AdminLog);
AdminLog.belongsTo(User);

Category.belongsToMany(Tour, { through: 'CategoryTour', foreignKey: "category_id" });
Tour.belongsToMany(Category, { through: 'CategoryTour', foreignKey: "tour_id" });

Location.belongsToMany(Tour, { through: 'LocationTour', foreignKey: "location_id" });
Tour.belongsToMany(Location, { through: 'LocationTour', foreignKey: "tour_id" });

Hotel.belongsToMany(Tour, { through: 'HotelTour', foreignKey: "hotel_id" });
Tour.belongsToMany(Hotel, { through: 'HotelTour', foreignKey: "tour_id" });

Location.hasMany(Hotel, { foreignKey: "location_id" });
Hotel.belongsTo(Location, { foreignKey: "location_id" });

Location.hasMany(Destination, { foreignKey: "location_id" });
Destination.belongsTo(Location, { foreignKey: "location_id" });

Category.hasMany(Location, { foreignKey: "fixedCategoryId" });
Location.belongsTo(Category, { foreignKey: "fixedCategoryId", as: "fixedCategory" });

// Tour có thể đi nhiều điểm đến
Destination.belongsToMany(Tour, { through: "DestinationTour", foreignKey: "destination_id" });
Tour.belongsToMany(Destination, { through: "DestinationTour", foreignKey: "tour_id" });

Tour.hasMany(TourSchedule);
TourSchedule.belongsTo(Tour);

Tour.hasMany(Booking);
Booking.belongsTo(Tour);

Tour.hasMany(Review);
Review.belongsTo(Tour);

Tour.hasMany(Wishlist);
Wishlist.belongsTo(Tour);

Tour.belongsToMany(Guide, { through: TourGuide });
Guide.belongsToMany(Tour, { through: TourGuide });

Tour.hasMany(Document);
Document.belongsTo(Tour);

// Booking -> Payment & Invoice
Booking.hasMany(Payment);
Payment.belongsTo(Booking);

Booking.hasOne(Invoice);
Invoice.belongsTo(Booking);

// Promotion
Promotion.hasMany(Booking);
Booking.belongsTo(Promotion);

// Transport & Hotel
Transport.hasMany(Tour);
Tour.belongsTo(Transport);

Hotel.hasMany(Room);
Room.belongsTo(Hotel);

module.exports = {
    sequelize,
    User,
    Tour,
    Booking,
    Payment,
    Category,
    Review,
    Wishlist,
    Notification,
    Invoice,
    Complaint,
    AdminLog,
    Location,
    TourSchedule,
    Guide,
    TourGuide,
    Document,
    Promotion,
    Transport,
    Hotel,
    Room,
    CategoryTour,
    Destination
};
