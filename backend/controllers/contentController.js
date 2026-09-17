const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const model = require("../models/contentModel");
const { success, created } = require("../utils/response");

const uploadBanner = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed."));
    }

    cb(null, true);
  },
});

function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

async function list(req, res) {
  return success(
    res,
    await model.list(req.params.type, req.query.all !== "true"),
  );
}

async function get(req, res) {
  const item = await model.find(req.params.type, req.params.id);

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Content not found.",
    });
  }

  return success(res, item);
}

async function create(req, res) {
  return created(res, await model.create(req.params.type, req.body));
}

async function update(req, res) {
  const item = await model.update(
    req.params.type,
    req.params.id,
    req.body,
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Content not found.",
    });
  }

  return success(res, item);
}

async function remove(req, res) {
  const item = await model.remove(
    req.params.type,
    req.params.id,
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Content not found.",
    });
  }

  return success(res, item);
}

async function homepage(req, res) {
  return success(
    res,
    await model.getHomepageSections(),
  );
}

async function addProduct(req, res) {
  return created(
    res,
    await model.addProductToSection(
      req.params.sectionId,
      req.body.product_id,
      Number(req.body.sort_order || 0),
    ),
  );
}

async function removeProduct(req, res) {
  const item = await model.removeProductFromSection(
    req.params.sectionId,
    req.params.productId,
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Section product not found.",
    });
  }

  return success(res, item);
}

/* =========================================================
   BANNER IMAGE UPLOAD
   ========================================================= */

async function uploadBannerImage(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "An image file is required.",
    });
  }

  const uploaded = await uploadBufferToCloudinary(
    req.file.buffer,
    "anisphone/banners",
  );

  return success(res, {
    image_url: uploaded.secure_url,
    url: uploaded.secure_url,
    secure_url: uploaded.secure_url,
    public_id: uploaded.public_id,
  });
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  homepage,
  addProduct,
  removeProduct,

  uploadBanner,
  uploadBannerImage,
};