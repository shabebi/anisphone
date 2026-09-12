const model = require("../models/adminCatalogModel");
const { success, created } = require("../utils/response");

async function list(req,res) { return success(res, await model.list(req.params.resource)); }
async function create(req,res) { return created(res, await model.create(req.params.resource, req.body)); }
async function update(req,res) {
  const item = await model.update(req.params.resource, req.params.id, req.body);
  if (!item) return res.status(404).json({success:false,message:"Record not found."});
  return success(res,item);
}
async function remove(req,res) {
  const item = await model.remove(req.params.resource, req.params.id);
  if (!item) return res.status(404).json({success:false,message:"Record not found."});
  return success(res,item);
}
async function variantColorAdd(req,res) {
  return created(res, await model.assignVariantColor(req.params.variantId, req.body.color_id));
}
async function variantColorRemove(req,res) {
  const item = await model.removeVariantColor(req.params.variantId, req.params.colorId);
  if (!item) return res.status(404).json({success:false,message:"Variant color not found."});
  return success(res,item);
}
async function productColorAdd(req,res) {
  return created(res, await model.assignProductColor(req.params.productId, req.body.color_id));
}
async function productColorRemove(req,res) {
  const item = await model.removeProductColor(req.params.productId, req.params.colorId);
  if (!item) return res.status(404).json({success:false,message:"Product color not found."});
  return success(res,item);
}
async function offerProductAdd(req,res) {
  return created(res, await model.assignOfferProduct(req.params.offerId, req.body.product_id));
}
async function offerProductRemove(req,res) {
  const item = await model.removeOfferProduct(req.params.offerId, req.params.productId);
  if (!item) return res.status(404).json({success:false,message:"Offer product not found."});
  return success(res,item);
}

module.exports = {
  list,create,update,remove,
  variantColorAdd,variantColorRemove,
  productColorAdd,productColorRemove,
  offerProductAdd,offerProductRemove
};
