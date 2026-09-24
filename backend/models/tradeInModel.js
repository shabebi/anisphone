const { query } = require("../db");

async function createTradeInRequest(data) {
  const {
    user_id,
    device_type,
    brand,
    model,
    storage,
    account_free,
    working,
    surface_condition,
    screen_condition,
    body_condition,
    complete,
    battery_capacity,
    name,
    phone,
    notes,
    language,
  } = data;

  const result = await query(
    `
      INSERT INTO trade_in_requests (
        user_id,
        device_type,
        brand,
        model,
        storage,
        account_free,
        working,
        surface_condition,
        screen_condition,
        body_condition,
        complete,
        battery_capacity,
        name,
        phone,
        notes,
        language,
        status
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        'pending'
      )
      RETURNING *
    `,
    [
      user_id,
      device_type,
      brand,
      model,
      storage,
      account_free,
      working,
      surface_condition,
      screen_condition,
      body_condition,
      complete,
      battery_capacity,
      name,
      phone,
      notes || null,
      language || "ar",
    ]
  );

  return result.rows[0];
}

async function getAllTradeInRequests() {
  const result = await query(
    `
      SELECT
        t.*,
        u.name AS user_name,
        u.phone AS user_phone
      FROM trade_in_requests t
      LEFT JOIN users u ON u.id = t.user_id
      ORDER BY t.created_at DESC
    `
  );

  return result.rows;
}

async function getTradeInRequestById(id) {
  const result = await query(
    `
      SELECT
        t.*,
        u.name AS user_name,
        u.phone AS user_phone
      FROM trade_in_requests t
      LEFT JOIN users u ON u.id = t.user_id
      WHERE t.id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function updateTradeInRequest(id, data) {
  const { status, admin_notes } = data;

  const result = await query(
    `
      UPDATE trade_in_requests
      SET
        status = COALESCE($1, status),
        admin_notes = COALESCE($2, admin_notes),
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `,
    [status ?? null, admin_notes ?? null, id]
  );

  return result.rows[0] || null;
}

async function deleteTradeInRequest(id) {
  const result = await query(
    `
      DELETE FROM trade_in_requests
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  createTradeInRequest,
  getAllTradeInRequests,
  getTradeInRequestById,
  updateTradeInRequest,
  deleteTradeInRequest,
};
