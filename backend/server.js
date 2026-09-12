const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const {
  port,
  nodeEnv,
  frontendUrl,
  adminFrontendUrl
} = require("./config/env");
const { testConnection } = require("./db");
const asyncHandler = require("./utils/asyncHandler");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const contentRoutes = require("./routes/contentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const branchRoutes = require("./routes/branchRoutes");
const adminCatalogRoutes = require("./routes/adminCatalogRoutes");
const contactRoutes = require("./routes/contactRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(cors({
  origin: [frontendUrl, adminFrontendUrl],
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (nodeEnv !== "test") {
  app.use(morgan("dev"));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

app.use("/api", apiLimiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Anis Phone API is running.",
    version: "v1"
  });
});

app.get("/api/v1/health", asyncHandler(async (req, res) => {
  const database = await testConnection();
  res.json({
    success: true,
    message: "Backend and Neon database are connected.",
    database_time: database.now
  });
}));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/favorites", favoriteRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/branches", branchRoutes);
app.use("/api/v1/admin/catalog", adminCatalogRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/requests", requestRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await testConnection();
    app.listen(port, () => {
      console.log("======================================");
      console.log("Anis Phone Backend");
      console.log(`Environment: ${nodeEnv}`);
      console.log(`Server: http://localhost:${port}`);
      console.log(`API: http://localhost:${port}/api/v1`);
      console.log(`Health: http://localhost:${port}/api/v1/health`);
      console.log("Neon database: connected");
      console.log("======================================");
    });
  } catch (error) {
    console.error("Could not start server:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;
