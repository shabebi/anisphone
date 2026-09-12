const { query } = require("../db");

async function listUsers() {
  const result = await query(
    `SELECT id,name,phone,role,is_active,phone_verified_at,created_at
     FROM users ORDER BY created_at DESC`,
    []
  );
  return result.rows;
}

async function updateUser(id, data) {
  const result = await query(
    `UPDATE users
     SET name=COALESCE($2,name),
         phone=COALESCE($3,phone),
         role=COALESCE($4,role),
         is_active=COALESCE($5,is_active)
     WHERE id=$1
     RETURNING id,name,phone,role,is_active,phone_verified_at,created_at`,
    [id, data.name, data.phone, data.role, data.is_active]
  );
  return result.rows[0] || null;
}

async function dashboardStats() {
  const result = await query(
    `SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM products WHERE is_active=true) AS active_products,
      (SELECT COUNT(*) FROM categories) AS categories,
      (SELECT COUNT(*) FROM brands) AS brands,
      (SELECT COUNT(*) FROM whatsapp_orders) AS whatsapp_orders,
      (SELECT COUNT(*) FROM reviews WHERE is_approved=false) AS pending_reviews,
      (SELECT COUNT(*) FROM contact_messages WHERE is_read=false) AS unread_messages,
      (SELECT COUNT(*) FROM product_requests) AS product_requests`,
    []
  );
  return result.rows[0];
}

async function listContactMessages() {
  const result = await query(
    `SELECT * FROM contact_messages ORDER BY created_at DESC`,
    []
  );
  return result.rows;
}

async function markContactRead(id, isRead) {
  const result = await query(
    `UPDATE contact_messages SET is_read=$2
     WHERE id=$1 RETURNING *`,
    [id, isRead]
  );
  return result.rows[0] || null;
}

async function createContactMessage(data) {
  const result = await query(
    `INSERT INTO contact_messages (name,phone,message)
     VALUES ($1,$2,$3) RETURNING *`,
    [data.name, data.phone ?? null, data.message]
  );
  return result.rows[0];
}

async function listProductRequests() {
  const result = await query(
    `SELECT pr.*, u.name AS user_name, u.phone
     FROM product_requests pr
     JOIN users u ON u.id=pr.user_id
     ORDER BY pr.created_at DESC`,
    []
  );
  return result.rows;
}

async function createProductRequest(userId, data) {
  const result = await query(
    `INSERT INTO product_requests
      (user_id,product_name_ar,product_name_en,message)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [userId, data.product_name_ar ?? null, data.product_name_en ?? null, data.message ?? null]
  );
  return result.rows[0];
}

module.exports = {
  listUsers,
  updateUser,
  dashboardStats,
  listContactMessages,
  markContactRead,
  createContactMessage,
  listProductRequests,
  createProductRequest
};
