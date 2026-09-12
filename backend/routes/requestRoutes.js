const router = require("express").Router();
const controller = require("../controllers/adminController");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.post("/", protect, asyncHandler(controller.createProductRequest));

module.exports = router;
