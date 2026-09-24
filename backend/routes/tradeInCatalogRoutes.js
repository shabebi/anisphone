const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/auth");
const {
  publicCatalog,
  adminCatalog,
  makeHandlers,
} = require("../controllers/tradeInCatalogController");


// ===============================
// CUSTOMER CATALOG
// ===============================

router.get("/catalog", publicCatalog);


// ===============================
// ADMIN CATALOG
// ===============================

router.get("/admin/catalog", protect, adminOnly, adminCatalog);


// Device Types
{
  const h = makeHandlers("device-types");

  router.get("/admin/device-types", protect, adminOnly, h.list);
  router.post("/admin/device-types", protect, adminOnly, h.create);
  router.patch("/admin/device-types/:id", protect, adminOnly, h.update);
  router.delete("/admin/device-types/:id", protect, adminOnly, h.remove);
}


// Brands
{
  const h = makeHandlers("brands");

  router.get("/admin/brands", protect, adminOnly, h.list);
  router.post("/admin/brands", protect, adminOnly, h.create);
  router.patch("/admin/brands/:id", protect, adminOnly, h.update);
  router.delete("/admin/brands/:id", protect, adminOnly, h.remove);
}


// Models
{
  const h = makeHandlers("models");

  router.get("/admin/models", protect, adminOnly, h.list);
  router.post("/admin/models", protect, adminOnly, h.create);
  router.patch("/admin/models/:id", protect, adminOnly, h.update);
  router.delete("/admin/models/:id", protect, adminOnly, h.remove);
}


// Storage Options
{
  const h = makeHandlers("storage-options");

  router.get("/admin/storage-options", protect, adminOnly, h.list);
  router.post("/admin/storage-options", protect, adminOnly, h.create);
  router.patch("/admin/storage-options/:id", protect, adminOnly, h.update);
  router.delete("/admin/storage-options/:id", protect, adminOnly, h.remove);
}


module.exports = router;