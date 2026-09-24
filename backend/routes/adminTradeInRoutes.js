const express = require("express");
const router = express.Router();

const {
  getTradeIns,
  getTradeIn,
  updateTradeIn,
  deleteTradeIn,
} = require("../controllers/tradeInController");

const { protect, adminOnly } = require("../middleware/auth");

// Admin-only trade-in management.
router.use(protect, adminOnly);

router.get("/", getTradeIns);
router.get("/:id", getTradeIn);
router.patch("/:id", updateTradeIn);
router.delete("/:id", deleteTradeIn);

module.exports = router;
