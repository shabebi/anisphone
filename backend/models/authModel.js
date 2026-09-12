const { query } = require("../db");

async function findByPhone(phone) {
  const result = await query(
    `SELECT id, name, phone, password_hash, role, is_active, phone_verified_at, created_at
     FROM users WHERE phone = $1 LIMIT 1`,
    [phone]
  );
  return result.rows[0] || null;
}

async function findById(id) {
  const result = await query(
    `SELECT id, name, phone, role, is_active, phone_verified_at, created_at
     FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

async function createUser({ name, phone, passwordHash }) {
  const result = await query(
    `INSERT INTO users (name, phone, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, phone, role, is_active, phone_verified_at, created_at`,
    [name, phone, passwordHash]
  );
  return result.rows[0];
}

async function updateProfile(id, { name, phone }) {
  const result = await query(
    `UPDATE users
     SET name = COALESCE($2, name),
         phone = COALESCE($3, phone)
     WHERE id = $1
     RETURNING id, name, phone, role, is_active, phone_verified_at, created_at`,
    [id, name ?? null, phone ?? null]
  );
  return result.rows[0] || null;
}

async function updatePassword(id, passwordHash) {
  const result = await query(
    `UPDATE users SET password_hash = $2 WHERE id = $1 RETURNING id`,
    [id, passwordHash]
  );
  return result.rows[0] || null;
}

module.exports = {
  findByPhone,
  findById,
  createUser,
  updateProfile,
  updatePassword
};
