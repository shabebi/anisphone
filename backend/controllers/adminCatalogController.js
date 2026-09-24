const model = require("../models/adminCatalogModel");
const { success, created } = require("../utils/response");
const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");

const uploadCategoryImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }
    cb(null, true);
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "anisphone/categories", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });
}

async function uploadCategory(req,res) {
  if (!req.file) {
    return res.status(400).json({ success:false, message:"يرجى اختيار صورة." });
  }

  const result = await uploadBufferToCloudinary(req.file.buffer);
  return success(res, {
    image_url: result.secure_url,
    public_id: result.public_id,
  });
}

async function list(req,res) { return success(res, await model.list(req.params.resource)); }
async function create(req,res) {
  if (req.params.resource === "categories" && !String(req.body?.image || "").trim()) {
    return res.status(400).json({ success:false, message:"يجب رفع صورة للتصنيف." });
  }
  return created(res, await model.create(req.params.resource, req.body));
}
async function update(req,res) {
  if (req.params.resource === "categories" && req.body?.image === "") {
    return res.status(400).json({ success:false, message:"يجب أن يحتوي التصنيف على صورة." });
  }
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
  uploadCategory,
  uploadCategoryImage,
  variantColorAdd,variantColorRemove,
  productColorAdd,productColorRemove,
  offerProductAdd,offerProductRemove
};
