const express = require("express");
const router = express.Router();

const { createTradeIn } = require("../controllers/tradeInController");
const { protect } = require("../middleware/auth");

// Customer trade-in submissions require a logged-in customer.
router.post("/", protect, createTradeIn);

module.exports = router;
