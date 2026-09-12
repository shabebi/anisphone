const router = require("express").Router();
const controller = require("../controllers/adminCatalogController");
const { protect, adminOnly } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect, adminOnly);

router.get("/:resource", asyncHandler(controller.list));
router.post("/:resource", asyncHandler(controller.create));
router.patch("/:resource/:id", asyncHandler(controller.update));
router.delete("/:resource/:id", asyncHandler(controller.remove));

router.post("/product-variants/:variantId/colors", asyncHandler(controller.variantColorAdd));
router.delete("/product-variants/:variantId/colors/:colorId", asyncHandler(controller.variantColorRemove));

router.post("/products/:productId/colors", asyncHandler(controller.productColorAdd));
router.delete("/products/:productId/colors/:colorId", asyncHandler(controller.productColorRemove));

router.post("/offers/:offerId/products", asyncHandler(controller.offerProductAdd));
router.delete("/offers/:offerId/products/:productId", asyncHandler(controller.offerProductRemove));

module.exports = router;
