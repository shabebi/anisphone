const router = require("express").Router();
const controller = require("../controllers/reviewController");
const { protect, adminOnly } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

/*
 * STORE REVIEWS
 */

// Public - approved store reviews only
router.get(
  "/store",
  asyncHandler(controller.listStore)
);

// Public - average rating + total reviews
router.get(
  "/store/stats",
  asyncHandler(controller.storeStats)
);

// Logged-in user's existing store review
router.get(
  "/store/my",
  protect,
  asyncHandler(controller.myStoreReview)
);

// Logged-in customer creates/updates store review
router.post(
  "/store",
  protect,
  asyncHandler(controller.createStore)
);

/*
 * PRODUCT REVIEWS
 */

router.get(
  "/product/:productId",
  asyncHandler(controller.list)
);

router.post(
  "/product/:productId",
  protect,
  asyncHandler(controller.create)
);

/*
 * ADMIN
 */

router.get(
  "/admin/all",
  protect,
  adminOnly,
  asyncHandler(controller.all)
);

router.patch(
  "/admin/:id/approve",
  protect,
  adminOnly,
  asyncHandler(controller.approve)
);

module.exports = router;