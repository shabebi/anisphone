const { query } = require("../db");

async function getCatalog(includeInactive = false) {
  const active = includeInactive ? "" : "WHERE is_active = TRUE";
  const [deviceTypes, brands, models, storage] = await Promise.all([
    query(`SELECT * FROM trade_in_device_types ${active} ORDER BY sort_order, name_en`),
    query(`SELECT * FROM trade_in_brands ${active} ORDER BY sort_order, name_en`),
    query(`SELECT * FROM trade_in_models ${active} ORDER BY sort_order, name_en`),
    query(`SELECT * FROM trade_in_storage_options ${active} ORDER BY sort_order, value`),
  ]);

  return {
    device_types: deviceTypes.rows,
    brands: brands.rows,
    models: models.rows,
    storage_options: storage.rows,
  };
}

const tableMap = {
  "device-types": "trade_in_device_types",
  brands: "trade_in_brands",
  models: "trade_in_models",
  "storage-options": "trade_in_storage_options",
};

async function list(type, includeInactive = true) {
  const table = tableMap[type];
  if (!table) throw new Error("Invalid trade-in catalog resource");
  const where = includeInactive ? "" : "WHERE is_active = TRUE";
  const order = type === "storage-options" ? "sort_order, value" : "sort_order, name_en";
  const result = await query(`SELECT * FROM ${table} ${where} ORDER BY ${order}`);
  return result.rows;
}

async function create(type, data) {
  const table = tableMap[type];
  if (!table) throw new Error("Invalid trade-in catalog resource");

  if (type === "device-types") {
    const result = await query(
      `INSERT INTO ${table} (name_ar, name_en, has_storage, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.name_ar, data.name_en, data.has_storage !== false, data.is_active !== false, Number(data.sort_order || 0)]
    );
    return result.rows[0];
  }

  if (type === "brands") {
    const result = await query(
      `INSERT INTO ${table} (device_type_id, name_ar, name_en, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [data.device_type_id, data.name_ar, data.name_en, data.is_active !== false, Number(data.sort_order || 0)]
    );
    return result.rows[0];
  }

  if (type === "models") {
    const result = await query(
      `INSERT INTO ${table} (device_type_id, brand_id, name_ar, name_en, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.device_type_id, data.brand_id, data.name_ar, data.name_en, data.is_active !== false, Number(data.sort_order || 0)]
    );
    return result.rows[0];
  }

  const result = await query(
    `INSERT INTO ${table} (device_type_id, value, is_active, sort_order)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [data.device_type_id, data.value, data.is_active !== false, Number(data.sort_order || 0)]
  );
  return result.rows[0];
}

async function update(type, id, data) {
  const table = tableMap[type];
  if (!table) throw new Error("Invalid trade-in catalog resource");

  if (type === "device-types") {
    const result = await query(
      `UPDATE ${table}
       SET name_ar=$1, name_en=$2, has_storage=$3, is_active=$4, sort_order=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [data.name_ar, data.name_en, data.has_storage !== false, data.is_active !== false, Number(data.sort_order || 0), id]
    );
    return result.rows[0];
  }

  if (type === "brands") {
    const result = await query(
      `UPDATE ${table}
       SET device_type_id=$1, name_ar=$2, name_en=$3, is_active=$4, sort_order=$5, updated_at=NOW()
       WHERE id=$6 RETURNING *`,
      [data.device_type_id, data.name_ar, data.name_en, data.is_active !== false, Number(data.sort_order || 0), id]
    );
    return result.rows[0];
  }

  if (type === "models") {
    const result = await query(
      `UPDATE ${table}
       SET device_type_id=$1, brand_id=$2, name_ar=$3, name_en=$4, is_active=$5, sort_order=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [data.device_type_id, data.brand_id, data.name_ar, data.name_en, data.is_active !== false, Number(data.sort_order || 0), id]
    );
    return result.rows[0];
  }

  const result = await query(
    `UPDATE ${table}
     SET device_type_id=$1, value=$2, is_active=$3, sort_order=$4, updated_at=NOW()
     WHERE id=$5 RETURNING *`,
    [data.device_type_id, data.value, data.is_active !== false, Number(data.sort_order || 0), id]
  );
  return result.rows[0];
}

async function remove(type, id) {
  const table = tableMap[type];
  if (!table) throw new Error("Invalid trade-in catalog resource");
  await query(`DELETE FROM ${table} WHERE id=$1`, [id]);
}

module.exports = { getCatalog, list, create, update, remove };
