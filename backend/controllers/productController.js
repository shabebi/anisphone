const productModel = require("../models/productModel");
const { success, created } = require("../utils/response");

async function list(req, res) {
  return success(res, await productModel.listProducts(req.query, req.query.admin === "true"));
}

async function get(req, res) {
  const product = await productModel.findProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  return success(res, product);
}

async function getBySlug(req, res) {
  const product = await productModel.findProductBySlug(req.params.slug);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  return success(res, product);
}

async function create(req, res) {
  return created(res, await productModel.createProduct(req.body));
}

async function update(req, res) {
  const product = await productModel.updateProduct(req.params.id, req.body);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  return success(res, product);
}

async function remove(req, res) {
  const product = await productModel.deleteProduct(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  return success(res, { id: product.id });
}

async function addImage(req, res) {
  return created(res, await productModel.addImage(req.params.id, req.body));
}

async function deleteImage(req, res) {
  const image = await productModel.deleteImage(req.params.imageId);
  if (!image) return res.status(404).json({ success: false, message: "Image not found." });
  return success(res, image);
}

async function inventory(req, res) {
  return success(res, await productModel.setInventory(
    req.params.id,
    Number(req.body.quantity),
    req.body.is_available !== false
  ));
}

async function categories(req, res) {
  return success(res, await productModel.listCategories(req.query.admin === "true"));
}

async function brands(req, res) {
  return success(res, await productModel.listBrands(req.query.admin === "true"));
}

async function colors(req, res) {
  return success(res, await productModel.listColors());
}

module.exports = {
  list, get, getBySlug, create, update, remove,
  addImage, deleteImage, inventory, categories, brands, colors
};
