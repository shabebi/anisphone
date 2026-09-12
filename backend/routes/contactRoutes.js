const router = require("express").Router();
const controller = require("../controllers/adminController");
const asyncHandler = require("../utils/asyncHandler");

router.post("/", asyncHandler(controller.createContact));

module.exports = router;
