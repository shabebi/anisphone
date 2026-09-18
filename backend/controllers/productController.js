const { v2: cloudinary } = require("cloudinary");
const multer = require("multer");
const productModel = require("../models/productModel");
const { success, created } = require("../utils/response");

const uploadImage = multer({
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

function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });
}

async function list(req, res) {
  return success(
    res,
    await productModel.listProducts(
      req.query,
      req.query.admin === "true",
    ),
  );
}

async function get(req, res) {
  const value = String(req.params.id || "").trim();

  // ProductDetailsPage uses clean product slugs in the URL.
  // Only send UUID-shaped values to findProductById().
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );

  const product = isUuid
    ? await productModel.findProductById(value)
    : await productModel.findProductBySlug(value);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  return success(res, product);
}

async function getBySlug(req, res) {
  const product = await productModel.findProductBySlug(req.params.slug);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }
  return success(res, product);
}

async function create(req, res) {
  return created(res, await productModel.createProduct(req.body));
}

async function update(req, res) {
  const product = await productModel.updateProduct(req.params.id, req.body);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }
  return success(res, product);
}

async function remove(req, res) {
  const product = await productModel.deleteProduct(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }
  return success(res, { id: product.id });
}

/* =========================================================
   PRODUCT COLORS
   ========================================================= */

async function listProductColors(req, res) {
  const product = await productModel.getById(req.params.id, true);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  return success(
    res,
    await productModel.listProductColors(req.params.id),
  );
}

async function addProductColor(req, res) {
  const productId = req.params.id;
  const colorId = req.body.color_id;

  if (!colorId) {
    return res.status(400).json({
      success: false,
      message: "color_id is required.",
    });
  }

  const product = await productModel.getById(productId, true);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  try {
    const color = await productModel.addProductColor(productId, colorId);

    if (!color) {
      return res.status(404).json({
        success: false,
        message: "Color not found.",
      });
    }

    return created(res, color);
  } catch (error) {
    if (error.code === "23503") {
      return res.status(404).json({
        success: false,
        message: "Product or color not found.",
      });
    }
    throw error;
  }
}

async function removeProductColor(req, res) {
  const productId = req.params.id;
  const colorId = req.params.colorId;

  const image = await productModel.getImageByProductAndColor(
    productId,
    colorId,
  );

  if (image) {
    return res.status(409).json({
      success: false,
      message: "Delete the color image before removing this color.",
    });
  }

  const removed = await productModel.removeProductColor(
    productId,
    colorId,
  );

  if (!removed) {
    return res.status(404).json({
      success: false,
      message: "Product color not found.",
    });
  }

  return success(res, removed);
}

/* =========================================================
   PRODUCT IMAGES
   ========================================================= */

async function listImages(req, res) {
  const product = await productModel.getById(req.params.id, true);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  return success(res, await productModel.listImages(req.params.id));
}

async function addImage(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "An image file is required.",
    });
  }

  const productId = req.params.id;
  const colorId = req.body.color_id;

  if (!colorId) {
    return res.status(400).json({
      success: false,
      message: "color_id is required for a product color image.",
    });
  }

  const product = await productModel.getById(productId, true);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found.",
    });
  }

  const productColors = await productModel.listProductColors(productId);
  const colorBelongsToProduct = productColors.some(
    (color) => String(color.id) === String(colorId),
  );

  if (!colorBelongsToProduct) {
    return res.status(400).json({
      success: false,
      message: "This color is not attached to the product.",
    });
  }

  const existing = await productModel.getImageByProductAndColor(
    productId,
    colorId,
  );

  const uploaded = await uploadBufferToCloudinary(
    req.file.buffer,
    `anisphone/products/${productId}`,
  );

  if (existing) {
    const updated = await productModel.updateImage(
      existing.id,
      {
        image_url: uploaded.secure_url,
        color_id: colorId,
      },
      productId,
    );

    return success(res, updated);
  }

  const hasImages = await productModel.hasImages(productId);

  const image = await productModel.addImage(productId, {
    image_url: uploaded.secure_url,
    color_id: colorId,
    is_primary: !hasImages,
    sort_order: 0,
  });

  return created(res, image);
}

async function deleteImage(req, res) {
  const image = await productModel.deleteImage(
    req.params.imageId,
    req.params.id,
  );

  if (!image) {
    return res.status(404).json({
      success: false,
      message: "Image not found.",
    });
  }

  return success(res, image);
}

async function setPrimaryImage(req, res) {
  const image = await productModel.setPrimaryImage(
    req.params.id,
    req.params.imageId,
  );

  if (!image) {
    return res.status(404).json({
      success: false,
      message: "Image not found.",
    });
  }

  return success(res, image);
}

async function inventory(req, res) {
  return success(
    res,
    await productModel.setInventory(
      req.params.id,
      Number(req.body.quantity),
      req.body.is_available !== false,
    ),
  );
}

async function categories(req, res) {
  return success(
    res,
    await productModel.listCategories(req.query.admin === "true"),
  );
}

async function brands(req, res) {
  return success(
    res,
    await productModel.listBrands(req.query.admin === "true"),
  );
}

async function colors(req, res) {
  return success(res, await productModel.listColors());
}

module.exports = {
  list,
  get,
  getBySlug,
  create,
  update,
  remove,

  listProductColors,
  addProductColor,
  removeProductColor,

  listImages,
  addImage,
  deleteImage,
  setPrimaryImage,

  inventory,
  categories,
  brands,
  colors,

  uploadImage,
};
