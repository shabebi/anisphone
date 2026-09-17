const { query } = require("../db");

async function listForProduct(productId, approvedOnly = true) {
  const result = await query(
    `SELECT r.id, r.product_id, r.user_id, r.rating,
            r.comment_ar, r.comment_en, r.is_approved, r.created_at,
            u.name AS user_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = $1
       ${approvedOnly ? "AND r.is_approved = true" : ""}
     ORDER BY r.created_at DESC`,
    [productId]
  );

  return result.rows;
}

async function create(userId, data) {
  const result = await query(
    `INSERT INTO reviews
      (user_id, product_id, rating, comment_ar, comment_en)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET
       rating = EXCLUDED.rating,
       comment_ar = EXCLUDED.comment_ar,
       comment_en = EXCLUDED.comment_en,
       is_approved = false
     RETURNING *`,
    [
      userId,
      data.product_id,
      data.rating,
      data.comment_ar ?? null,
      data.comment_en ?? null
    ]
  );

  return result.rows[0];
}

/*
 * STORE REVIEWS
 */

async function listStoreReviews() {
  const result = await query(
    `SELECT
       r.id,
       r.user_id,
       r.rating,
       r.comment_ar,
       r.comment_en,
       r.is_approved,
       r.created_at,
       u.name AS user_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id IS NULL
       AND r.is_approved = true
     ORDER BY r.created_at DESC`,
    []
  );

  return result.rows;
}

async function getUserStoreReview(userId) {
  const result = await query(
    `SELECT
       id,
       user_id,
       rating,
       comment_ar,
       comment_en,
       is_approved,
       created_at
     FROM reviews
     WHERE user_id = $1
       AND product_id IS NULL
     LIMIT 1`,
    [userId]
  );

  return result.rows[0] || null;
}

async function createStoreReview(userId, data) {
  const result = await query(
    `INSERT INTO reviews
      (
        user_id,
        product_id,
        rating,
        comment_ar,
        comment_en,
        is_approved
      )
     VALUES ($1, NULL, $2, $3, $4, false)
     ON CONFLICT (user_id)
     WHERE product_id IS NULL
     DO UPDATE SET
       rating = EXCLUDED.rating,
       comment_ar = EXCLUDED.comment_ar,
       comment_en = EXCLUDED.comment_en,
       is_approved = false
     RETURNING *`,
    [
      userId,
      data.rating,
      data.comment_ar ?? null,
      data.comment_en ?? null
    ]
  );

  return result.rows[0];
}

async function approve(id, approved) {
  const result = await query(
    `UPDATE reviews
     SET is_approved = $2
     WHERE id = $1
     RETURNING *`,
    [id, approved]
  );

  return result.rows[0] || null;
}

async function listAll() {
  const result = await query(
    `SELECT
       r.*,
       u.name AS user_name,
       u.phone,
       p.name_en AS product_name_en,
       p.name_ar AS product_name_ar
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     LEFT JOIN products p ON p.id = r.product_id
     ORDER BY r.created_at DESC`,
    []
  );

  return result.rows;
}

async function getStoreStats() {
  const result = await query(
    `SELECT
       COUNT(*)::int AS total_reviews,
       COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating
     FROM reviews
     WHERE product_id IS NULL
       AND is_approved = true`,
    []
  );

  return result.rows[0];
}

module.exports = {
  listForProduct,
  create,
  approve,
  listAll,
  listStoreReviews,
  getUserStoreReview,
  createStoreReview,
  getStoreStats
};