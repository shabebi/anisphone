const { query } = require("../db");

async function createTradeIn(data) {
  const result = await query(
    `INSERT INTO trade_in_requests
      (user_id, device_type, brand, model, storage, account_free, working,
       surface_condition, screen_condition, body_condition, complete,
       battery_capacity, name, phone, notes, language, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pending')
     RETURNING *`,
    [
      data.user_id,
      data.device_type,
      data.brand,
      data.model,
      data.storage || null,
      data.account_free,
      data.working,
      data.surface_condition,
      data.screen_condition,
      data.body_condition,
      data.complete,
      data.battery_capacity,
      data.name,
      data.phone,
      data.notes || null,
      data.language || "ar",
    ]
  );
  return result.rows[0];
}

async function getTradeIns() {
  const result = await query(
    `SELECT t.*, u.name AS user_name, u.phone AS user_phone
     FROM trade_in_requests t
     LEFT JOIN users u ON u.id = t.user_id
     ORDER BY t.created_at DESC`
  );
  return result.rows;
}

async function getTradeIn(id) {
  const result = await query(
    `SELECT t.*, u.name AS user_name, u.phone AS user_phone
     FROM trade_in_requests t
     LEFT JOIN users u ON u.id = t.user_id
     WHERE t.id=$1`, [id]
  );
  return result.rows[0] || null;
}

async function updateTradeIn(id, data) {
  const result = await query(
    `UPDATE trade_in_requests
     SET status=COALESCE($1,status), admin_notes=COALESCE($2,admin_notes), updated_at=NOW()
     WHERE id=$3
     RETURNING *`,
    [data.status ?? null, data.admin_notes ?? null, id]
  );
  return result.rows[0] || null;
}

async function deleteTradeIn(id) {
  await query(`DELETE FROM trade_in_requests WHERE id=$1`, [id]);
}

module.exports = { createTradeIn, getTradeIns, getTradeIn, updateTradeIn, deleteTradeIn };
