const router = require("express").Router();
const controller = require("../controllers/contentController");
const { protect, adminOnly } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.get("/homepage", asyncHandler(controller.homepage));

router.get("/:type", asyncHandler(controller.list));
router.get("/:type/:id", asyncHandler(controller.get));

router.post("/:type", protect, adminOnly, asyncHandler(controller.create));
router.patch("/:type/:id", protect, adminOnly, asyncHandler(controller.update));
router.delete("/:type/:id", protect, adminOnly, asyncHandler(controller.remove));

router.post(
  "/homepage-sections/:sectionId/products",
  protect, adminOnly, asyncHandler(controller.addProduct)
);
router.delete(
  "/homepage-sections/:sectionId/products/:productId",
  protect, adminOnly, asyncHandler(controller.removeProduct)
);

module.exports = router;
