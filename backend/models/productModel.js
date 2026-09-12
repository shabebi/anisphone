const { query } = require("../db");

const productSelect = `
  SELECT
    p.*,
    b.name_ar AS brand_name_ar,
    b.name_en AS brand_name_en,
    b.slug AS brand_slug,
    b.logo AS brand_logo,
    c.name_ar AS category_name_ar,
    c.name_en AS category_name_en,
    c.slug AS category_slug,
    COALESCE(i.quantity, 0) AS inventory_quantity,
    COALESCE(i.is_available, false) AS inventory_available,
    COALESCE(
      (SELECT json_agg(json_build_object(
        'id', pi.id, 'image_url', pi.image_url,
        'sort_order', pi.sort_order, 'is_primary', pi.is_primary,
        'color_id', pi.color_id
      ) ORDER BY pi.sort_order, pi.created_at)
      FROM product_images pi WHERE pi.product_id = p.id),
      '[]'::json
    ) AS images,
    COALESCE(
      (SELECT json_agg(json_build_object(
        'id', pv.id, 'name_ar', pv.name_ar, 'name_en', pv.name_en,
        'price', pv.price, 'is_active', pv.is_active,
        'colors', COALESCE((
          SELECT json_agg(json_build_object(
            'id', col.id, 'name_ar', col.name_ar,
            'name_en', col.name_en, 'hex_code', col.hex_code
          ) ORDER BY col.name_en)
          FROM product_variant_colors pvc
          JOIN colors col ON col.id=pvc.color_id
          WHERE pvc.variant_id=pv.id
        ), '[]'::json)
      ) ORDER BY pv.created_at)
      FROM product_variants pv
      WHERE pv.product_id = p.id),
      '[]'::json
    ) AS variants,
    COALESCE(
      (SELECT json_agg(json_build_object(
        'id', pc.id, 'name_ar', col.name_ar,
        'name_en', col.name_en, 'hex_code', col.hex_code
      ) ORDER BY col.name_en)
      FROM product_colors pc
      JOIN colors col ON col.id=pc.color_id
      WHERE pc.product_id=p.id),
      '[]'::json
    ) AS colors,
    COALESCE(
      (SELECT json_agg(json_build_object(
        'id', ps.id, 'section_ar', ps.section_ar,
        'section_en', ps.section_en, 'name_ar', ps.name_ar,
        'name_en', ps.name_en, 'value_ar', ps.value_ar,
        'value_en', ps.value_en, 'sort_order', ps.sort_order
      ) ORDER BY ps.sort_order, ps.created_at)
      FROM product_specifications ps WHERE ps.product_id=p.id),
      '[]'::json
    ) AS specifications,
    COALESCE(
      (SELECT json_agg(json_build_object(
        'id', rp.related_product_id,
        'name_ar', r.name_ar, 'name_en', r.name_en,
        'slug', r.slug, 'price', r.price, 'old_price', r.old_price,
        'sort_order', rp.sort_order,
        'image_url', (
          SELECT pi.image_url FROM product_images pi
          WHERE pi.product_id=r.id
          ORDER BY pi.is_primary DESC, pi.sort_order LIMIT 1
        )
      ) ORDER BY rp.sort_order)
      FROM related_products rp
      JOIN products r ON r.id=rp.related_product_id AND r.is_active=true
      WHERE rp.product_id=p.id),
      '[]'::json
    ) AS related_products,
    COALESCE(
      (SELECT json_agg(json_build_object(
        'id', o.id, 'name_ar', o.name_ar, 'name_en', o.name_en,
        'description_ar', o.description_ar, 'description_en', o.description_en,
        'discount_type', o.discount_type, 'discount_value', o.discount_value,
        'start_at', o.start_at, 'end_at', o.end_at
      ) ORDER BY o.created_at DESC)
      FROM offer_products op
      JOIN offers o ON o.id=op.offer_id
      WHERE op.product_id=p.id
        AND o.is_active=true
        AND (o.start_at IS NULL OR o.start_at <= now())
        AND (o.end_at IS NULL OR o.end_at >= now())),
      '[]'::json
    ) AS offers,
    COALESCE(
      (SELECT ROUND(AVG(r.rating)::numeric, 2)
       FROM reviews r WHERE r.product_id=p.id AND r.is_approved=true),
      0
    ) AS average_rating,
    (SELECT COUNT(*) FROM reviews r
     WHERE r.product_id=p.id AND r.is_approved=true) AS review_count
  FROM products p
  JOIN brands b ON b.id = p.brand_id
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN product_inventory i ON i.product_id = p.id
`;

async function listProducts(filters = {}, includeInactive = false) {
  const conditions = includeInactive ? ["1=1"] : ["p.is_active = true"];
  const params = [];
  let n = 1;

  if (filters.category) {
    conditions.push(`c.slug = $${n++}`);
    params.push(filters.category);
  }

  if (filters.brand) {
    conditions.push(`b.slug = $${n++}`);
    params.push(filters.brand);
  }

  if (filters.condition) {
    conditions.push(`p.condition = $${n++}`);
    params.push(filters.condition);
  }

  if (filters.featured === "true") {
    conditions.push(`p.is_featured = true`);
  }

  if (filters.search) {
    conditions.push(`(
      p.name_en ILIKE $${n} OR p.name_ar ILIKE $${n}
      OR p.description_en ILIKE $${n} OR p.description_ar ILIKE $${n}
    )`);

    params.push(`%${filters.search}%`);
    n++;
  }

  const limit = Math.min(
    Math.max(Number(filters.limit) || 24, 1),
    100
  );

  const offset = Math.max(
    Number(filters.offset) || 0,
    0
  );

  const result = await query(
    `${productSelect}
     WHERE ${conditions.join(" AND ")}
     ORDER BY
       CASE LOWER(c.name_en)
         WHEN 'phones' THEN 1
         WHEN 'computers' THEN 2
         WHEN 'tablets' THEN 3
         WHEN 'headphones' THEN 4
         WHEN 'watches' THEN 5
         WHEN 'accessories' THEN 6
         ELSE 999
       END,
       p.created_at DESC
     LIMIT $${n} OFFSET $${n + 1}`,
    [...params, limit, offset]
  );

  return result.rows;
}

async function findProductById(id, includeInactive = false) {
  const active = includeInactive
    ? ""
    : "AND p.is_active = true";

  const result = await query(
    `${productSelect}
     WHERE p.id=$1 ${active}
     LIMIT 1`,
    [id]
  );

  return result.rows[0] || null;
}

async function findProductBySlug(slug, includeInactive = false) {
  const active = includeInactive
    ? ""
    : "AND p.is_active = true";

  const result = await query(
    `${productSelect}
     WHERE p.slug=$1 ${active}
     LIMIT 1`,
    [slug]
  );

  return result.rows[0] || null;
}

async function createProduct(data) {
  const result = await query(
    `INSERT INTO products
      (
        name_ar,
        name_en,
        slug,
        description_ar,
        description_en,
        brand_id,
        category_id,
        price,
        old_price,
        is_active,
        is_featured,
        is_best_seller,
        is_new_arrival,
        is_top_deal,
        best_seller_order,
        new_arrival_order,
        top_deal_order,
        condition
      )
     VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        COALESCE($10,true),
        COALESCE($11,false),
        COALESCE($12,false),
        COALESCE($13,false),
        COALESCE($14,false),
        COALESCE($15,0),
        COALESCE($16,0),
        COALESCE($17,0),
        COALESCE($18,'new')
      )
     RETURNING *`,
    [
      data.name_ar,
      data.name_en,
      data.slug,
      data.description_ar ?? null,
      data.description_en ?? null,
      data.brand_id,
      data.category_id,
      data.price,
      data.old_price ?? null,
      data.is_active,
      data.is_featured,
      data.is_best_seller,
      data.is_new_arrival,
      data.is_top_deal,
      data.best_seller_order,
      data.new_arrival_order,
      data.top_deal_order,
      data.condition,
    ]
  );

  return result.rows[0];
}

async function updateProduct(id, data) {
  const result = await query(
    `UPDATE products SET
      name_ar=COALESCE($2,name_ar),
      name_en=COALESCE($3,name_en),
      slug=COALESCE($4,slug),
      description_ar=COALESCE($5,description_ar),
      description_en=COALESCE($6,description_en),
      brand_id=COALESCE($7,brand_id),
      category_id=COALESCE($8,category_id),
      price=COALESCE($9,price),
      old_price=$10,
      is_active=COALESCE($11,is_active),
      is_featured=COALESCE($12,is_featured),
      is_best_seller=COALESCE($13,is_best_seller),
      is_new_arrival=COALESCE($14,is_new_arrival),
      is_top_deal=COALESCE($15,is_top_deal),
      best_seller_order=COALESCE($16,best_seller_order),
      new_arrival_order=COALESCE($17,new_arrival_order),
      top_deal_order=COALESCE($18,top_deal_order),
      condition=COALESCE($19,condition)
     WHERE id=$1
     RETURNING *`,
    [
      id,
      data.name_ar,
      data.name_en,
      data.slug,
      data.description_ar,
      data.description_en,
      data.brand_id,
      data.category_id,
      data.price,
      data.old_price ?? null,
      data.is_active,
      data.is_featured,
      data.is_best_seller,
      data.is_new_arrival,
      data.is_top_deal,
      data.best_seller_order,
      data.new_arrival_order,
      data.top_deal_order,
      data.condition,
    ]
  );

  return result.rows[0] || null;
}

async function deleteProduct(id) {
  const result = await query(
    `DELETE FROM products WHERE id=$1 RETURNING id`,
    [id]
  );

  return result.rows[0] || null;
}

async function addImage(productId, data) {
  const result = await query(
    `INSERT INTO product_images
      (product_id,image_url,sort_order,is_primary,color_id)
     VALUES
      ($1,$2,COALESCE($3,0),COALESCE($4,false),$5)
     RETURNING *`,
    [
      productId,
      data.image_url,
      data.sort_order,
      data.is_primary,
      data.color_id ?? null,
    ]
  );

  return result.rows[0];
}

async function deleteImage(imageId) {
  const result = await query(
    `DELETE FROM product_images
     WHERE id=$1
     RETURNING id`,
    [imageId]
  );

  return result.rows[0] || null;
}

async function setInventory(
  productId,
  quantity,
  isAvailable = true
) {
  const result = await query(
    `INSERT INTO product_inventory
      (product_id,quantity,is_available)
     VALUES ($1,$2,$3)
     ON CONFLICT (product_id)
     DO UPDATE SET
       quantity=EXCLUDED.quantity,
       is_available=EXCLUDED.is_available,
       updated_at=now()
     RETURNING *`,
    [productId, quantity, isAvailable]
  );

  return result.rows[0];
}

async function listCategories(activeOnly = true) {
  const result = await query(
    `SELECT *
     FROM categories
     ${activeOnly ? "WHERE is_active=true" : ""}
     ORDER BY
       CASE LOWER(name_en)
         WHEN 'phones' THEN 1
         WHEN 'computers' THEN 2
         WHEN 'tablets' THEN 3
         WHEN 'headphones' THEN 4
         WHEN 'watches' THEN 5
         WHEN 'accessories' THEN 6
         ELSE 999
       END,
       created_at DESC`,
    []
  );

  return result.rows;
}

async function listBrands(activeOnly = true) {
  const result = await query(
    `SELECT *
     FROM brands
     ${activeOnly ? "WHERE is_active=true" : ""}
     ORDER BY created_at DESC`,
    []
  );

  return result.rows;
}

async function listColors() {
  const result = await query(
    `SELECT *
     FROM colors
     ORDER BY name_en`,
    []
  );

  return result.rows;
}

module.exports = {
  listProducts,
  findProductById,
  findProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  addImage,
  deleteImage,
  setInventory,
  listCategories,
  listBrands,
  listColors,
};