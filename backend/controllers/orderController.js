const orderModel = require("../models/orderModel");
const { whatsappNumber } = require("../config/env");
const { success, created } = require("../utils/response");

async function create(req, res) {
  const message = String(req.body.message || "").trim();
  if (!message) {
    return res.status(400).json({ success: false, message: "Order message is required." });
  }

  const order = await orderModel.createWhatsAppOrder(req.user.id, message);

  let whatsappUrl = null;
  if (whatsappNumber) {
    whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  }

  return created(res, { order, whatsapp_url: whatsappUrl });
}

async function mine(req, res) {
  return success(res, await orderModel.listUserOrders(req.user.id));
}

async function all(req, res) {
  return success(res, await orderModel.listAllOrders());
}

async function get(req, res) {
  const order = await orderModel.getOrder(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });
  return success(res, order);
}

module.exports = { create, mine, all, get };
