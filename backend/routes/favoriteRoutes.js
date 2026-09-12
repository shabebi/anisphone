const router = require("express").Router();
const controller = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect);
router.get("/", asyncHandler(controller.list));
router.post("/", asyncHandler(controller.add));
router.delete("/:productId", asyncHandler(controller.remove));

module.exports = router;
