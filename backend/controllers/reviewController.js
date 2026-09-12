const model = require("../models/reviewModel");
const { success, created } = require("../utils/response");

async function list(req, res) {
  return success(res, await model.listForProduct(req.params.productId));
}

async function create(req, res) {
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be an integer from 1 to 5." });
  }
  return created(res, await model.create(req.user.id, {
    ...req.body,
    rating,
    product_id: req.params.productId
  }));
}

async function all(req, res) {
  return success(res, await model.listAll());
}

async function approve(req, res) {
  const review = await model.approve(req.params.id, req.body.is_approved !== false);
  if (!review) return res.status(404).json({ success: false, message: "Review not found." });
  return success(res, review);
}

module.exports = { list, create, all, approve };
