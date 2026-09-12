const { query } = require("../db");

const RESOURCES = {
  categories: {
    table: "categories",
    fields: ["name_ar", "name_en", "slug", "image", "is_active"],
  },
  brands: {
    table: "brands",
    fields: ["name_ar", "name_en", "slug", "logo", "is_active"],
  },
  colors: {
    table: "colors",
    fields: ["name_ar", "name_en", "hex_code"],
  },
  offers: {
    table: "offers",
    fields: [
      "name_ar",
      "name_en",
      "description_ar",
      "description_en",
      "discount_type",
      "discount_value",
      "start_at",
      "end_at",
      "is_active",
    ],
  },
  product_variants: {
    table: "product_variants",
    fields: ["product_id", "name_ar", "name_en", "price", "is_active"],
  },
  product_specifications: {
    table: "product_specifications",
    fields: [
      "product_id",
      "section_ar",
      "section_en",
      "name_ar",
      "name_en",
      "value_ar",
      "value_en",
      "sort_order",
    ],
  },
  branches: {
    table: "branches",
    fields: [
      "name_ar",
      "name_en",
      "address_ar",
      "address_en",
      "phone",
      "map_url",
      "is_active",
    ],
  },
  related_products: {
    table: "related_products",
    fields: ["product_id", "related_product_id", "sort_order"],
  },
};

function getConfig(resource) {
  const config = RESOURCES[resource];
  if (!config) {
    const err = new Error("Unsupported admin resource.");
    err.status = 400;
    throw err;
  }
  return config;
}

async function list(resource) {
  const config = getConfig(resource);
  let order = "created_at DESC";
  if (resource === "colors") order = "name_en ASC";
  if (resource === "related_products") order = "sort_order ASC";

  const result = await query(
    `SELECT * FROM ${config.table} ORDER BY ${order}`,
    [],
  );
  return result.rows;
}

async function create(resource, data) {
  const config = getConfig(resource);
  const fields = config.fields.filter((f) => data[f] !== undefined);
  if (!fields.length) {
    const err = new Error("No supported fields supplied.");
    err.status = 400;
    throw err;
  }
  const values = fields.map((f) => data[f]);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(",");
  const result = await query(
    `INSERT INTO ${config.table} (${fields.join(",")})
     VALUES (${placeholders}) RETURNING *`,
    values,
  );
  return result.rows[0];
}

async function update(resource, id, data) {
  const config = getConfig(resource);
  const fields = config.fields.filter((f) => data[f] !== undefined);
  if (!fields.length) {
    const err = new Error("No supported fields supplied.");
    err.status = 400;
    throw err;
  }
  const values = fields.map((f) => data[f]);
  const assignments = fields.map((f, i) => `${f}=$${i + 2}`).join(",");
  const result = await query(
    `UPDATE ${config.table} SET ${assignments} WHERE id=$1 RETURNING *`,
    [id, ...values],
  );
  return result.rows[0] || null;
}

async function remove(resource, id) {
  const config = getConfig(resource);
  const result = await query(
    `DELETE FROM ${config.table} WHERE id=$1 RETURNING id`,
    [id],
  );
  return result.rows[0] || null;
}

async function assignVariantColor(variantId, colorId) {
  const result = await query(
    `INSERT INTO product_variant_colors (variant_id,color_id)
     VALUES ($1,$2)
     ON CONFLICT (variant_id,color_id) DO NOTHING
     RETURNING *`,
    [variantId, colorId],
  );
  return result.rows[0] || null;
}

async function removeVariantColor(variantId, colorId) {
  const result = await query(
    `DELETE FROM product_variant_colors
     WHERE variant_id=$1 AND color_id=$2 RETURNING id`,
    [variantId, colorId],
  );
  return result.rows[0] || null;
}

async function assignProductColor(productId, colorId) {
  const result = await query(
    `INSERT INTO product_colors (product_id,color_id)
     VALUES ($1,$2)
     ON CONFLICT (product_id,color_id) DO NOTHING
     RETURNING *`,
    [productId, colorId],
  );
  return result.rows[0] || null;
}

async function removeProductColor(productId, colorId) {
  const result = await query(
    `DELETE FROM product_colors
     WHERE product_id=$1 AND color_id=$2 RETURNING id`,
    [productId, colorId],
  );
  return result.rows[0] || null;
}

async function assignOfferProduct(offerId, productId) {
  const result = await query(
    `INSERT INTO offer_products (offer_id,product_id)
     VALUES ($1,$2)
     ON CONFLICT (offer_id,product_id) DO NOTHING
     RETURNING *`,
    [offerId, productId],
  );
  return result.rows[0] || null;
}

async function removeOfferProduct(offerId, productId) {
  const result = await query(
    `DELETE FROM offer_products
     WHERE offer_id=$1 AND product_id=$2 RETURNING id`,
    [offerId, productId],
  );
  return result.rows[0] || null;
}

module.exports = {
  list,
  create,
  update,
  remove,
  assignVariantColor,
  removeVariantColor,
  assignProductColor,
  removeProductColor,
  assignOfferProduct,
  removeOfferProduct,
};
