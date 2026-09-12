const model = require("../models/contentModel");
const { success, created } = require("../utils/response");

async function list(req, res) {
  return success(res, await model.list(req.params.type, req.query.all !== "true"));
}

async function get(req, res) {
  const item = await model.find(req.params.type, req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Content not found." });
  return success(res, item);
}

async function create(req, res) {
  return created(res, await model.create(req.params.type, req.body));
}

async function update(req, res) {
  const item = await model.update(req.params.type, req.params.id, req.body);
  if (!item) return res.status(404).json({ success: false, message: "Content not found." });
  return success(res, item);
}

async function remove(req, res) {
  const item = await model.remove(req.params.type, req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Content not found." });
  return success(res, item);
}

async function homepage(req, res) {
  return success(res, await model.getHomepageSections());
}

async function addProduct(req, res) {
  return created(res, await model.addProductToSection(
    req.params.sectionId,
    req.body.product_id,
    Number(req.body.sort_order || 0)
  ));
}

async function removeProduct(req, res) {
  const item = await model.removeProductFromSection(req.params.sectionId, req.params.productId);
  if (!item) return res.status(404).json({ success: false, message: "Section product not found." });
  return success(res, item);
}

module.exports = { list, get, create, update, remove, homepage, addProduct, removeProduct };
