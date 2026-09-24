const model = require("../models/tradeInModel");
const { query } = require("../db");

const ALLOWED_STATUSES = new Set(["pending", "contacted", "accepted", "rejected", "completed"]);

async function createTradeIn(req, res) {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Authentication required." });
    }

    const body = req.body || {};
    const required = [
      "device_type", "brand", "model", "account_free", "working",
      "surface_condition", "screen_condition", "body_condition", "complete",
      "battery_capacity"
    ];

    for (const key of required) {
      if (body[key] === undefined || body[key] === null || body[key] === "") {
        return res.status(400).json({ success: false, message: `${key} is required.` });
      }
    }

    // Validate that the selected device/brand/model/storage still exists and is active.
    const deviceResult = await query(
      `SELECT id, has_storage FROM trade_in_device_types
       WHERE is_active=TRUE AND (name_en=$1 OR name_ar=$1) LIMIT 1`,
      [body.device_type]
    );
    const device = deviceResult.rows[0];
    if (!device) {
      return res.status(400).json({ success:false, message:"Invalid device type." });
    }

    const brandResult = await query(
      `SELECT id FROM trade_in_brands
       WHERE device_type_id=$1 AND is_active=TRUE AND (name_en=$2 OR name_ar=$2) LIMIT 1`,
      [device.id, body.brand]
    );
    const brand = brandResult.rows[0];
    if (!brand) {
      return res.status(400).json({ success:false, message:"Invalid brand for this device type." });
    }

    const modelResult = await query(
      `SELECT id FROM trade_in_models
       WHERE device_type_id=$1 AND brand_id=$2 AND is_active=TRUE AND (name_en=$3 OR name_ar=$3) LIMIT 1`,
      [device.id, brand.id, body.model]
    );
    if (!modelResult.rows[0]) {
      return res.status(400).json({ success:false, message:"Invalid model for this brand and device type." });
    }

    if (device.has_storage) {
      const storageResult = await query(
        `SELECT id FROM trade_in_storage_options
         WHERE device_type_id=$1 AND is_active=TRUE AND value=$2 LIMIT 1`,
        [device.id, body.storage]
      );
      if (!storageResult.rows[0]) {
        return res.status(400).json({ success:false, message:"Invalid storage option for this device type." });
      }
    }

    const userResult = await query(`SELECT id, name, phone FROM users WHERE id=$1 LIMIT 1`, [req.user.id]);
    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ success: false, message: "User account not found." });

    const data = await model.createTradeIn({
      ...body,
      user_id: user.id,
      name: user.name,
      phone: user.phone,
    });

    return res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("createTradeIn:", error);
    return res.status(500).json({ success: false, message: "Failed to create trade-in request." });
  }
}

async function getTradeIns(req, res) {
  try { return res.json({ success: true, data: await model.getTradeIns() }); }
  catch (e) { console.error(e); return res.status(500).json({ success:false, message:"Failed to load trade-in requests." }); }
}

async function getTradeIn(req, res) {
  try {
    const data = await model.getTradeIn(req.params.id);
    if (!data) return res.status(404).json({ success:false, message:"Trade-in request not found." });
    return res.json({ success:true, data });
  } catch (e) { console.error(e); return res.status(500).json({ success:false, message:"Failed to load trade-in request." }); }
}

async function updateTradeIn(req, res) {
  try {
    const body = req.body || {};
    if (body.status !== undefined && !ALLOWED_STATUSES.has(body.status)) {
      return res.status(400).json({ success:false, message:"Invalid trade-in status." });
    }
    const data = await model.updateTradeIn(req.params.id, body);
    if (!data) return res.status(404).json({ success:false, message:"Trade-in request not found." });
    return res.json({ success:true, data });
  } catch (e) { console.error(e); return res.status(500).json({ success:false, message:"Failed to update trade-in request." }); }
}

async function deleteTradeIn(req, res) {
  try { await model.deleteTradeIn(req.params.id); return res.json({ success:true }); }
  catch (e) { console.error(e); return res.status(500).json({ success:false, message:"Failed to delete trade-in request." }); }
}

module.exports = { createTradeIn, getTradeIns, getTradeIn, updateTradeIn, deleteTradeIn };
