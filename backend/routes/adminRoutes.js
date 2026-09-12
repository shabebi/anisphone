const router = require("express").Router();
const controller = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect, adminOnly);

router.get("/stats", asyncHandler(controller.stats));
router.get("/users", asyncHandler(controller.users));
router.patch("/users/:id", asyncHandler(controller.updateUser));

router.get("/contact-messages", asyncHandler(controller.contactMessages));
router.patch("/contact-messages/:id/read", asyncHandler(controller.readContact));

router.get("/product-requests", asyncHandler(controller.productRequests));

module.exports = router;
