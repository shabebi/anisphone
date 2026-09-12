const router = require("express").Router();
const controller = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.post("/register", asyncHandler(controller.register));
router.post("/login", asyncHandler(controller.login));
router.get("/me", protect, asyncHandler(controller.me));
router.patch("/me", protect, asyncHandler(controller.updateProfile));
router.patch("/password", protect, asyncHandler(controller.changePassword));

module.exports = router;
