require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models"); // chỉ dùng 1 sequelize duy nhất
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const tourRoutes = require("./routes/tourRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const locationRoutes = require("./routes/locationRoutes");
const hotelRoutes = require("./routes/hotelRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
// const bookingRoutes = require("./routes/bookingRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");

const app = express();  
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/destinations", destinationRoutes);
// app.use("/api/bookings", bookingRoutes);
// app.use("/api/payments", paymentRoutes);

sequelize.sync()
  .then(() => {
    console.log("✅ Database synced");
    app.listen(process.env.PORT, () => console.log(`🚀 Server running on port ${process.env.PORT}`));
  })
  .catch(err => console.error("❌ Sync error:", err));
