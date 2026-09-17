const router = require("express").Router();
const controller = require("../controllers/contentController");
const { protect, adminOnly } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

/* Homepage */
router.get(
  "/homepage",
  asyncHandler(controller.homepage),
);

/* Banner image upload */
router.post(
  "/banners/upload",
  protect,
  adminOnly,
  controller.uploadBanner.single("image"),
  asyncHandler(controller.uploadBannerImage),
);

/* Homepage section products */
router.post(
  "/homepage-sections/:sectionId/products",
  protect,
  adminOnly,
  asyncHandler(controller.addProduct),
);

router.delete(
  "/homepage-sections/:sectionId/products/:productId",
  protect,
  adminOnly,
  asyncHandler(controller.removeProduct),
);

/* Generic content */
router.get(
  "/:type",
  asyncHandler(controller.list),
);

router.get(
  "/:type/:id",
  asyncHandler(controller.get),
);

router.post(
  "/:type",
  protect,
  adminOnly,
  asyncHandler(controller.create),
);

router.patch(
  "/:type/:id",
  protect,
  adminOnly,
  asyncHandler(controller.update),
);

router.delete(
  "/:type/:id",
  protect,
  adminOnly,
  asyncHandler(controller.remove),
);

module.exports = router;