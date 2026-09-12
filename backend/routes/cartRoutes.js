const router = require("express").Router();
const controller = require("../controllers/cartController");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect);
router.get("/", asyncHandler(controller.get));
router.post("/items", asyncHandler(controller.add));
router.patch("/items/:itemId", asyncHandler(controller.update));
router.delete("/items/:itemId", asyncHandler(controller.remove));
router.delete("/", asyncHandler(controller.clear));

module.exports = router;
