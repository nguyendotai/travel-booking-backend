require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { sequelize } = require("./models");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const tourRoutes = require("./routes/tourRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const locationRoutes = require("./routes/locationRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const departureRoutes = require("./routes/departureRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

app.use(cors());

// ⚠️ KHÔNG dùng express.raw ở đây
app.use(express.json());

// Static folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/departures", departureRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reviews", reviewRoutes);

// 🚀 Khởi chạy server
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected");
    const PORT = process.env.PORT || 5000; // Giữ nguyên dòng này
    app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ Database connection error:", err));

// sequelize
//   .sync({ alter: true })
//   .then(() => {
//     console.log("✅ Database synced");
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
//   })
//   .catch((err) => console.error("❌ Sync error:", err));
