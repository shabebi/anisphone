const express = require("express");
const router = express.Router();
const {
  createTradeIn,
  getTradeIns,
  getTradeIn,
  updateTradeIn,
  deleteTradeIn,
} = require("../controllers/tradeInController");
const { protect, adminOnly } = require("../middleware/auth");

// Customer submission requires login. The backend derives name/phone from users.
router.post("/", protect, createTradeIn);

// Admin management.
router.get("/", protect, adminOnly, getTradeIns);
router.get("/:id", protect, adminOnly, getTradeIn);
router.patch("/:id", protect, adminOnly, updateTradeIn);
router.delete("/:id", protect, adminOnly, deleteTradeIn);

module.exports = router;
