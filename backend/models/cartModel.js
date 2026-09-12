const { query, withTransaction } = require("../db");

async function getOrCreateCart(userId) {
  const result = await query(
    `INSERT INTO carts (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING id, user_id, created_at`,
    [userId]
  );
  return result.rows[0];
}

async function getCart(userId) {
  const cart = await getOrCreateCart(userId);
  const items = await query(
    `SELECT
       ci.id, ci.product_id, ci.variant_id, ci.color_id, ci.quantity,
       p.name_ar, p.name_en, p.slug, p.price, p.old_price,
       pv.name_ar AS variant_name_ar, pv.name_en AS variant_name_en,
       pv.price AS variant_price,
       c.name_ar AS color_name_ar, c.name_en AS color_name_en, c.hex_code,
       COALESCE(
         (SELECT pi.image_url FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.is_primary DESC, pi.sort_order LIMIT 1),
         NULL
       ) AS image_url
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     LEFT JOIN product_variants pv ON pv.id = ci.variant_id
     LEFT JOIN colors c ON c.id = ci.color_id
     WHERE ci.cart_id = $1
     ORDER BY ci.created_at`,
    [cart.id]
  );
  return { ...cart, items: items.rows };
}

async function addItem(userId, data) {
  return withTransaction(async (client) => {
    const cartResult = await client.query(
      `INSERT INTO carts (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING id`,
      [userId]
    );
    const cartId = cartResult.rows[0].id;

    const product = await client.query(
      `SELECT p.id, p.is_active, i.quantity AS inventory_quantity,
              COALESCE(i.is_available, false) AS inventory_available
       FROM products p
       LEFT JOIN product_inventory i ON i.product_id = p.id
       WHERE p.id = $1`,
      [data.product_id]
    );

    if (!product.rows[0] || !product.rows[0].is_active) {
      const err = new Error("Product is not available.");
      err.status = 404;
      throw err;
    }

    const available = product.rows[0].inventory_quantity;
    if (product.rows[0].inventory_available && available < Number(data.quantity)) {
      const err = new Error("Requested quantity is not available.");
      err.status = 400;
      throw err;
    }

    const existing = await client.query(
      `SELECT id FROM cart_items
       WHERE cart_id=$1 AND product_id=$2
         AND variant_id IS NOT DISTINCT FROM $3
         AND color_id IS NOT DISTINCT FROM $4`,
      [cartId, data.product_id, data.variant_id ?? null, data.color_id ?? null]
    );

    let item;
    if (existing.rows[0]) {
      item = await client.query(
        `UPDATE cart_items SET quantity = quantity + $2
         WHERE id=$1 RETURNING *`,
        [existing.rows[0].id, Number(data.quantity)]
      );
    } else {
      item = await client.query(
        `INSERT INTO cart_items
          (cart_id, product_id, variant_id, color_id, quantity)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING *`,
        [cartId, data.product_id, data.variant_id ?? null,
         data.color_id ?? null, Number(data.quantity)]
      );
    }

    return item.rows[0];
  });
}

async function updateItem(userId, itemId, quantity) {
  const result = await query(
    `UPDATE cart_items ci
     SET quantity = $3
     FROM carts c
     WHERE ci.id=$1 AND ci.cart_id=c.id AND c.user_id=$2
     RETURNING ci.*`,
    [itemId, userId, quantity]
  );
  return result.rows[0] || null;
}

async function removeItem(userId, itemId) {
  const result = await query(
    `DELETE FROM cart_items ci
     USING carts c
     WHERE ci.id=$1 AND ci.cart_id=c.id AND c.user_id=$2
     RETURNING ci.id`,
    [itemId, userId]
  );
  return result.rows[0] || null;
}

async function clearCart(userId) {
  const result = await query(
    `DELETE FROM cart_items ci
     USING carts c
     WHERE ci.cart_id=c.id AND c.user_id=$1
     RETURNING ci.id`,
    [userId]
  );
  return result.rows;
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
