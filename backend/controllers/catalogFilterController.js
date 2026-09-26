const catalogFilterModel = require("../models/catalogFilterModel");

async function getFilters(req, res) {
  const data = await catalogFilterModel.getCatalogFilters();

  return res.status(200).json({
    success: true,
    data,
  });
}

module.exports = {
  getFilters,
};