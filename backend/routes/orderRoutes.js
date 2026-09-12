const router = require("express").Router();
const controller = require("../controllers/orderController");
const { protect, adminOnly } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect);
router.post("/whatsapp", asyncHandler(controller.create));
router.get("/mine", asyncHandler(controller.mine));
router.get("/admin", adminOnly, asyncHandler(controller.all));
router.get("/admin/:id", adminOnly, asyncHandler(controller.get));

module.exports = router;
