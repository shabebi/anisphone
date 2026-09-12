const { query } = require("../db");

async function getActiveBranches() {
  const result = await query(
    `
      SELECT
        id,
        name_ar,
        name_en,
        address_ar,
        address_en,
        phone,
        map_url,
        is_active,
        created_at
      FROM branches
      WHERE is_active = true
      ORDER BY created_at ASC
    `,
    []
  );

  return result.rows;
}

async function getAllBranches() {
  const result = await query(
    `
      SELECT
        id,
        name_ar,
        name_en,
        address_ar,
        address_en,
        phone,
        map_url,
        is_active,
        created_at
      FROM branches
      ORDER BY created_at ASC
    `,
    []
  );

  return result.rows;
}

async function getBranchById(id) {
  const result = await query(
    `
      SELECT
        id,
        name_ar,
        name_en,
        address_ar,
        address_en,
        phone,
        map_url,
        is_active,
        created_at
      FROM branches
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

async function createBranch(data) {
  const result = await query(
    `
      INSERT INTO branches (
        name_ar,
        name_en,
        address_ar,
        address_en,
        phone,
        map_url,
        is_active
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        COALESCE($7, true)
      )
      RETURNING *
    `,
    [
      data.name_ar,
      data.name_en,
      data.address_ar,
      data.address_en,
      data.phone,
      data.map_url || null,
      data.is_active,
    ]
  );

  return result.rows[0];
}

async function updateBranch(id, data) {
  const result = await query(
    `
      UPDATE branches
      SET
        name_ar = COALESCE($2, name_ar),
        name_en = COALESCE($3, name_en),
        address_ar = COALESCE($4, address_ar),
        address_en = COALESCE($5, address_en),
        phone = COALESCE($6, phone),
        map_url = COALESCE($7, map_url),
        is_active = COALESCE($8, is_active)
      WHERE id = $1
      RETURNING *
    `,
    [
      id,
      data.name_ar,
      data.name_en,
      data.address_ar,
      data.address_en,
      data.phone,
      data.map_url,
      data.is_active,
    ]
  );

  return result.rows[0] || null;
}

async function deleteBranch(id) {
  const result = await query(
    `
      DELETE FROM branches
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  getActiveBranches,
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
};