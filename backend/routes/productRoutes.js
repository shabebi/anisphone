const express = require("express");
const controller = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

/* Public product routes */
router.get("/", asyncHandler(controller.list));
router.get("/slug/:slug", asyncHandler(controller.getBySlug));
router.get("/categories", asyncHandler(controller.categories));
router.get("/brands", asyncHandler(controller.brands));
router.get("/colors", asyncHandler(controller.colors));

/* Product-specific colors */
router.get(
  "/:id/colors",
  protect,
  adminOnly,
  asyncHandler(controller.listProductColors),
);

router.post(
  "/:id/colors",
  protect,
  adminOnly,
  asyncHandler(controller.addProductColor),
);

router.delete(
  "/:id/colors/:colorId",
  protect,
  adminOnly,
  asyncHandler(controller.removeProductColor),
);

/* Product-specific images */
router.get(
  "/:id/images",
  protect,
  adminOnly,
  asyncHandler(controller.listImages),
);

router.post(
  "/:id/images",
  protect,
  adminOnly,
  controller.uploadImage.single("image"),
  asyncHandler(controller.addImage),
);

router.delete(
  "/:id/images/:imageId",
  protect,
  adminOnly,
  asyncHandler(controller.deleteImage),
);

router.patch(
  "/:id/images/:imageId/primary",
  protect,
  adminOnly,
  asyncHandler(controller.setPrimaryImage),
);

/* Single product */
router.get("/:id", asyncHandler(controller.get));

/* Admin product management */
router.post("/", protect, adminOnly, asyncHandler(controller.create));
router.patch("/:id", protect, adminOnly, asyncHandler(controller.update));
router.delete("/:id", protect, adminOnly, asyncHandler(controller.remove));

router.put(
  "/:id/inventory",
  protect,
  adminOnly,
  asyncHandler(controller.inventory),
);

module.exports = router;
