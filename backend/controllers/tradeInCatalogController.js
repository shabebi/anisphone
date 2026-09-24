const catalog = require("../models/tradeInCatalogModel");

function fail(res, error) {
  console.error("Trade-in catalog error:", error);
  return res.status(400).json({ success: false, message: error?.message || "فشل الطلب" });
}

async function publicCatalog(req, res) {
  try {
    const data = await catalog.getCatalog(false);
    return res.json({ success: true, data });
  } catch (error) {
    return fail(res, error);
  }
}

async function adminCatalog(req, res) {
  try {
    const data = await catalog.getCatalog(true);
    return res.json({ success: true, data });
  } catch (error) {
    return fail(res, error);
  }
}

function makeHandlers(type) {
  return {
    list: async (req, res) => {
      try { return res.json({ success: true, data: await catalog.list(type, true) }); }
      catch (e) { return fail(res, e); }
    },
    create: async (req, res) => {
      try { return res.status(201).json({ success: true, data: await catalog.create(type, req.body || {}) }); }
      catch (e) { return fail(res, e); }
    },
    update: async (req, res) => {
      try { return res.json({ success: true, data: await catalog.update(type, req.params.id, req.body || {}) }); }
      catch (e) { return fail(res, e); }
    },
    remove: async (req, res) => {
      try { await catalog.remove(type, req.params.id); return res.json({ success: true }); }
      catch (e) { return fail(res, e); }
    },
  };
}

module.exports = { publicCatalog, adminCatalog, makeHandlers };
