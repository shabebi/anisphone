const express = require("express");
const controller = require("../controllers/catalogFilterController");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(controller.getFilters));

module.exports = router;
