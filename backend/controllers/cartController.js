const cartModel = require("../models/cartModel");
const { success } = require("../utils/response");

async function get(req, res) {
  return success(res, await cartModel.getCart(req.user.id));
}

async function add(req, res) {
  const quantity = Number(req.body.quantity || 1);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ success: false, message: "Quantity must be a positive integer." });
  }
  await cartModel.addItem(req.user.id, { ...req.body, quantity });
  return success(res, await cartModel.getCart(req.user.id), 201);
}

async function update(req, res) {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ success: false, message: "Quantity must be a positive integer." });
  }
  const item = await cartModel.updateItem(req.user.id, req.params.itemId, quantity);
  if (!item) return res.status(404).json({ success: false, message: "Cart item not found." });
  return success(res, await cartModel.getCart(req.user.id));
}

async function remove(req, res) {
  const item = await cartModel.removeItem(req.user.id, req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: "Cart item not found." });
  return success(res, await cartModel.getCart(req.user.id));
}

async function clear(req, res) {
  await cartModel.clearCart(req.user.id);
  return success(res, await cartModel.getCart(req.user.id));
}

module.exports = { get, add, update, remove, clear };
