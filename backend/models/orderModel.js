const { query, withTransaction } = require("../db");

async function createWhatsAppOrder(userId, message) {
  return withTransaction(async (client) => {
    const order = await client.query(
      `INSERT INTO whatsapp_orders (user_id, message)
       VALUES ($1,$2) RETURNING *`,
      [userId, message]
    );

    await client.query(
      `DELETE FROM cart_items
       WHERE cart_id = (SELECT id FROM carts WHERE user_id=$1)`,
      [userId]
    );

    return order.rows[0];
  });
}

async function listUserOrders(userId) {
  const result = await query(
    `SELECT * FROM whatsapp_orders
     WHERE user_id=$1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function listAllOrders() {
  const result = await query(
    `SELECT wo.*, u.name AS user_name, u.phone
     FROM whatsapp_orders wo
     JOIN users u ON u.id=wo.user_id
     ORDER BY wo.created_at DESC`,
    []
  );
  return result.rows;
}

async function getOrder(id) {
  const result = await query(
    `SELECT wo.*, u.name AS user_name, u.phone
     FROM whatsapp_orders wo
     JOIN users u ON u.id=wo.user_id
     WHERE wo.id=$1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  createWhatsAppOrder,
  listUserOrders,
  listAllOrders,
  getOrder
};
