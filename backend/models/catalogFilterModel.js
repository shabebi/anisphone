const { query } = require("../db");

async function getCatalogFilters() {
  const [categoriesResult, brandsResult, colorsResult, priceResult] =
    await Promise.all([
      query(`
        SELECT
          id,
          name_ar,
          name_en,
          slug
        FROM categories
        ORDER BY name_en ASC
      `),

      query(`
        SELECT
          id,
          name_ar,
          name_en,
          slug
        FROM brands
        WHERE is_active = true
        ORDER BY name_en ASC
      `),

      query(`
        SELECT
          id,
          name_ar,
          name_en,
          hex_code
        FROM colors
        ORDER BY name_en ASC
      `),

      query(`
        SELECT
          COALESCE(MIN(price), 0) AS min_price,
          COALESCE(MAX(price), 0) AS max_price
        FROM products
        WHERE is_active = true
      `),
    ]);

  return {
    categories: categoriesResult.rows,
    brands: brandsResult.rows,
    colors: colorsResult.rows,
    price: {
      min: Number(priceResult.rows[0]?.min_price || 0),
      max: Number(priceResult.rows[0]?.max_price || 0),
    },
  };
}

module.exports = {
  getCatalogFilters,
};
