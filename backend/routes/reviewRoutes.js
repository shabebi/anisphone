const router = require("express").Router();
const controller = require("../controllers/reviewController");
const { protect, adminOnly } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.get("/product/:productId", asyncHandler(controller.list));
router.post("/product/:productId", protect, asyncHandler(controller.create));
router.get("/admin/all", protect, adminOnly, asyncHandler(controller.all));
router.patch("/admin/:id/approve", protect, adminOnly, asyncHandler(controller.approve));

module.exports = router;
