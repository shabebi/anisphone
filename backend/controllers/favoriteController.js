const model = require("../models/favoriteModel");
const { success, created } = require("../utils/response");

async function list(req, res) {
  return success(res, await model.listFavorites(req.user.id));
}

async function add(req, res) {
  return created(res, await model.add(req.user.id, req.body.product_id));
}

async function remove(req, res) {
  const item = await model.remove(req.user.id, req.params.productId);
  if (!item) return res.status(404).json({ success: false, message: "Favorite not found." });
  return success(res, item);
}

async function toggle(req, res) {
  const productId = String(req.body.product_id || "").trim();
  if (!productId) {
    return res.status(400).json({ success: false, message: "Product ID is required." });
  }

  const existing = await model.findOne(req.user.id, productId);

  if (existing) {
    await model.remove(req.user.id, productId);
    return success(res, { active: false });
  }

  await model.add(req.user.id, productId);
  return created(res, { active: true });
}

module.exports = { list, add, remove, toggle };
