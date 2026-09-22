const express = require("express");
const router = express.Router();

const { protect, adminOnly } = require("../middleware/auth");
const controller = require("../controllers/productSpecifications.controller");

// All specification endpoints require an authenticated admin
router.use(protect);
router.use(adminOnly);

// GET /api/v1/products/:productId/specifications
router.get(
  "/:productId/specifications",
  controller.getSpecifications
);

// PUT /api/v1/products/:productId/specifications
router.put(
  "/:productId/specifications",
  controller.replaceSpecifications
);

// POST /api/v1/products/:productId/specifications
router.post(
  "/:productId/specifications",
  controller.addSpecification
);

// PATCH /api/v1/products/:productId/specifications/:specificationId
router.patch(
  "/:productId/specifications/:specificationId",
  controller.editSpecification
);

// DELETE /api/v1/products/:productId/specifications/:specificationId
router.delete(
  "/:productId/specifications/:specificationId",
  controller.removeSpecification
);

module.exports = router;