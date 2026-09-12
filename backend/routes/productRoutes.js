const router = require("express").Router();
const controller = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(controller.list));
router.get("/slug/:slug", asyncHandler(controller.getBySlug));
router.get("/categories", asyncHandler(controller.categories));
router.get("/brands", asyncHandler(controller.brands));
router.get("/colors", asyncHandler(controller.colors));
router.get("/:id", asyncHandler(controller.get));

router.post("/", protect, adminOnly, asyncHandler(controller.create));
router.patch("/:id", protect, adminOnly, asyncHandler(controller.update));
router.delete("/:id", protect, adminOnly, asyncHandler(controller.remove));
router.post("/:id/images", protect, adminOnly, asyncHandler(controller.addImage));
router.delete("/:id/images/:imageId", protect, adminOnly, asyncHandler(controller.deleteImage));
router.put("/:id/inventory", protect, adminOnly, asyncHandler(controller.inventory));

module.exports = router;
