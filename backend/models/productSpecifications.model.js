const { query } = require("../db");

/**
 * Product Specifications model
 *
 * Expected table:
 * product_specifications(
 *   id,
 *   product_id,
 *   section_ar,
 *   section_en,
 *   name_ar,
 *   name_en,
 *   value_ar,
 *   value_en,
 *   sort_order,
 *   created_at
 * )
 */

const listSpecifications = async (productId) => {
  const result = await query(
    `SELECT
       id,
       product_id,
       section_ar,
       section_en,
       name_ar,
       name_en,
       value_ar,
       value_en,
       sort_order,
       created_at
     FROM product_specifications
     WHERE product_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [productId]
  );

  return result.rows;
};

const createSpecification = async (productId, data) => {
  const result = await query(
    `INSERT INTO product_specifications
      (product_id, section_ar, section_en, name_ar, name_en, value_ar, value_en, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING
       id,
       product_id,
       section_ar,
       section_en,
       name_ar,
       name_en,
       value_ar,
       value_en,
       sort_order,
       created_at`,
    [
      productId,
      data.section_ar || "",
      data.section_en || "",
      data.name_ar || "",
      data.name_en || "",
      data.value_ar || "",
      data.value_en || "",
      Number.isFinite(Number(data.sort_order)) ? Number(data.sort_order) : 0,
    ]
  );

  return result.rows[0];
};

const updateSpecification = async (specificationId, productId, data) => {
  const result = await query(
    `UPDATE product_specifications
     SET
       section_ar = $1,
       section_en = $2,
       name_ar = $3,
       name_en = $4,
       value_ar = $5,
       value_en = $6,
       sort_order = $7
     WHERE id = $8 AND product_id = $9
     RETURNING
       id,
       product_id,
       section_ar,
       section_en,
       name_ar,
       name_en,
       value_ar,
       value_en,
       sort_order,
       created_at`,
    [
      data.section_ar || "",
      data.section_en || "",
      data.name_ar || "",
      data.name_en || "",
      data.value_ar || "",
      data.value_en || "",
      Number.isFinite(Number(data.sort_order)) ? Number(data.sort_order) : 0,
      specificationId,
      productId,
    ]
  );

  return result.rows[0] || null;
};

const deleteSpecification = async (specificationId, productId) => {
  const result = await query(
    `DELETE FROM product_specifications
     WHERE id = $1 AND product_id = $2
     RETURNING id`,
    [specificationId, productId]
  );

  return result.rows[0] || null;
};

/**
 * Replace all specifications for a product.
 *
 * This is what the admin editor normally needs when pressing Save.
 * It intentionally removes rows omitted from the submitted list.
 */
const replaceSpecifications = async (productId, specifications) => {
  await query(
    `DELETE FROM product_specifications WHERE product_id = $1`,
    [productId]
  );

  const saved = [];

  for (let i = 0; i < specifications.length; i += 1) {
    const item = specifications[i] || {};
    const row = await createSpecification(productId, {
      ...item,
      sort_order:
        Number.isFinite(Number(item.sort_order))
          ? Number(item.sort_order)
          : i,
    });

    saved.push(row);
  }

  return saved;
};

module.exports = {
  listSpecifications,
  createSpecification,
  updateSpecification,
  deleteSpecification,
  replaceSpecifications,
};
