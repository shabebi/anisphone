const { query } = require("../db");

const TABLES = {
  banners: {
    table: "banners",
    fields: ["title_ar","title_en","description_ar","description_en","image_url","sort_order","is_active"]
  },
  faqs: {
    table: "faqs",
    fields: ["question_ar","question_en","answer_ar","answer_en","sort_order","is_active"]
  },
  branches: {
    table: "branches",
    fields: ["name_ar","name_en","address_ar","address_en","phone","map_url","is_active"]
  },
  homepage_sections: {
    table: "homepage_sections",
    fields: ["name_ar","name_en","section_type","sort_order","is_active"]
  }
};

function configFor(type) {
  const config = TABLES[type];
  if (!config) {
    const err = new Error("Unsupported content type.");
    err.status = 400;
    throw err;
  }
  return config;
}

async function list(type, activeOnly = true) {
  const config = configFor(type);
  const where = activeOnly ? "WHERE is_active=true" : "";
  const order = type === "branches" ? "created_at DESC" : "sort_order ASC, created_at DESC";
  const result = await query(
    `SELECT * FROM ${config.table} ${where} ORDER BY ${order}`,
    []
  );
  return result.rows;
}

async function find(type, id) {
  const config = configFor(type);
  const result = await query(
    `SELECT * FROM ${config.table} WHERE id=$1`,
    [id]
  );
  return result.rows[0] || null;
}

async function create(type, data) {
  const config = configFor(type);
  const fields = config.fields.filter((f) => data[f] !== undefined);
  const values = fields.map((f) => data[f]);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(",");
  const result = await query(
    `INSERT INTO ${config.table} (${fields.join(",")})
     VALUES (${placeholders}) RETURNING *`,
    values
  );
  return result.rows[0];
}

async function update(type, id, data) {
  const config = configFor(type);
  const fields = config.fields.filter((f) => data[f] !== undefined);
  if (!fields.length) return find(type, id);
  const values = fields.map((f) => data[f]);
  const assignments = fields.map((f, i) => `${f}=$${i + 2}`).join(",");
  const result = await query(
    `UPDATE ${config.table} SET ${assignments} WHERE id=$1 RETURNING *`,
    [id, ...values]
  );
  return result.rows[0] || null;
}

async function remove(type, id) {
  const config = configFor(type);
  const result = await query(
    `DELETE FROM ${config.table} WHERE id=$1 RETURNING id`,
    [id]
  );
  return result.rows[0] || null;
}

async function getHomepageSections() {
  const result = await query(
    `SELECT
       hs.*,
       COALESCE(
         json_agg(
           json_build_object(
             'id', p.id,
             'name_ar', p.name_ar,
             'name_en', p.name_en,
             'slug', p.slug,
             'price', p.price,
             'old_price', p.old_price,
             'image_url', (
               SELECT pi.image_url FROM product_images pi
               WHERE pi.product_id=p.id
               ORDER BY pi.is_primary DESC, pi.sort_order LIMIT 1
             ),
             'sort_order', hsp.sort_order
           ) ORDER BY hsp.sort_order
         ) FILTER (WHERE p.id IS NOT NULL),
         '[]'::json
       ) AS products
     FROM homepage_sections hs
     LEFT JOIN homepage_section_products hsp ON hsp.section_id=hs.id
     LEFT JOIN products p ON p.id=hsp.product_id AND p.is_active=true
     WHERE hs.is_active=true
     GROUP BY hs.id
     ORDER BY hs.sort_order`,
    []
  );
  return result.rows;
}

async function addProductToSection(sectionId, productId, sortOrder = 0) {
  const result = await query(
    `INSERT INTO homepage_section_products
      (section_id, product_id, sort_order)
     VALUES ($1,$2,$3)
     ON CONFLICT (section_id, product_id)
     DO UPDATE SET sort_order=EXCLUDED.sort_order
     RETURNING *`,
    [sectionId, productId, sortOrder]
  );
  return result.rows[0];
}

async function removeProductFromSection(sectionId, productId) {
  const result = await query(
    `DELETE FROM homepage_section_products
     WHERE section_id=$1 AND product_id=$2
     RETURNING id`,
    [sectionId, productId]
  );
  return result.rows[0] || null;
}

module.exports = {
  list, find, create, update, remove,
  getHomepageSections,
  addProductToSection,
  removeProductFromSection
};
