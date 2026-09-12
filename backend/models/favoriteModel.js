const { query } = require("../db");

async function listFavorites(userId) {
  const result = await query(
    `SELECT f.id, f.product_id, f.created_at,
            p.name_ar, p.name_en, p.slug, p.price, p.old_price,
            b.name_ar AS brand_name_ar, b.name_en AS brand_name_en,
            c.name_ar AS category_name_ar, c.name_en AS category_name_en,
            (SELECT pi.image_url FROM product_images pi
             WHERE pi.product_id=p.id
             ORDER BY pi.is_primary DESC, pi.sort_order LIMIT 1) AS image_url
     FROM favorites f
     JOIN products p ON p.id=f.product_id
     JOIN brands b ON b.id=p.brand_id
     JOIN categories c ON c.id=p.category_id
     WHERE f.user_id=$1
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function add(userId, productId) {
  const result = await query(
    `INSERT INTO favorites (user_id, product_id)
     VALUES ($1,$2)
     ON CONFLICT (user_id, product_id) DO NOTHING
     RETURNING *`,
    [userId, productId]
  );
  return result.rows[0] || null;
}

async function remove(userId, productId) {
  const result = await query(
    `DELETE FROM favorites
     WHERE user_id=$1 AND product_id=$2
     RETURNING id`,
    [userId, productId]
  );
  return result.rows[0] || null;
}

module.exports = { listFavorites, add, remove };
