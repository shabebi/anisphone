import React, { useEffect, useMemo, useState } from "react";
import "./ProductSection.css";

import titaniumImage from "../assets/titanium-pro-max-5g.png";
import foldableImage from "../assets/foldable-ultra-2025.png";
import ceramicImage from "../assets/ceramic-edition-flagship.png";
import desertGoldImage from "../assets/desert-gold-studio-edition.png";

const API_URL = "http://localhost:5000/api/v1";

const fallbackImages = [
  titaniumImage,
  foldableImage,
  ceramicImage,
  desertGoldImage,
];

export default function ProductSection({
  language = "en",
  onProductClick,
  onAddToCart,
  onWishlist,
  onViewMore,
}) {
  const isArabic = language === "ar";

  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] =
    useState("bestsellers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const content = {
    en: {
      eyebrow: "SEASONAL CURATED SELECTION",
      title: "Latest Smart Devices & Exclusive Offers",

      filters: [
        {
          id: "bestsellers",
          label: "Best Sellers",
        },
        {
          id: "new",
          label: "New Arrivals",
        },
        {
          id: "deals",
          label: "Top Deals",
        },
      ],

      viewMore: "View More",
      addToCart: "Add to Cart",

      loading: "Loading products...",
      error: "Unable to load products.",
      retry: "Try Again",
      noProducts: "No products found.",
    },

    ar: {
      eyebrow: "مختارات الموسم المميزة",
      title: "أحدث الأجهزة الذكية والعروض الحصرية",

      filters: [
        {
          id: "bestsellers",
          label: "الأكثر مبيعاً",
        },
        {
          id: "new",
          label: "الواصل حديثاً",
        },
        {
          id: "deals",
          label: "أفضل العروض",
        },
      ],

      viewMore: "عرض المزيد",
      addToCart: "إضافة للسلة",

      loading: "جاري تحميل المنتجات...",
      error: "تعذر تحميل المنتجات.",
      retry: "حاول مرة أخرى",
      noProducts: "لا توجد منتجات.",
    },
  };

  const current = isArabic ? content.ar : content.en;

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/products`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const result = await response.json();

      setProducts(result.data || []);
    } catch (err) {
      console.error("Products error:", err);
      setError(current.error);
    } finally {
      setLoading(false);
    }
  }

  /* ========================================
     FILTER PRODUCTS
  ======================================== */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeFilter === "bestsellers") {
      result = result
        .filter(
          (product) =>
            product.is_best_seller === true
        )
        .sort(
          (a, b) =>
            Number(
              a.best_seller_order || 999
            ) -
            Number(
              b.best_seller_order || 999
            )
        );
    }

    if (activeFilter === "new") {
      result = result
        .filter(
          (product) =>
            product.is_new_arrival === true
        )
        .sort(
          (a, b) =>
            Number(
              a.new_arrival_order || 999
            ) -
            Number(
              b.new_arrival_order || 999
            )
        );
    }

    if (activeFilter === "deals") {
      result = result
        .filter(
          (product) =>
            product.is_top_deal === true
        )
        .sort(
          (a, b) =>
            Number(
              a.top_deal_order || 999
            ) -
            Number(
              b.top_deal_order || 999
            )
        );
    }

    return result.slice(0, 4);
  }, [products, activeFilter]);

  /* ========================================
     PRODUCT IMAGE
  ======================================== */

  function getProductImage(product, index) {
    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const primaryImage =
        product.images.find(
          (image) => image.is_primary
        );

      return (
        primaryImage?.image_url ||
        product.images[0]?.image_url ||
        fallbackImages[
        index % fallbackImages.length
        ]
      );
    }

    return fallbackImages[
      index % fallbackImages.length
    ];
  }

  /* ========================================
     PRODUCT BADGE
  ======================================== */

  function getProductBadge(product) {
    const price = Number(
      product.price || 0
    );

    const oldPrice = Number(
      product.old_price || 0
    );

    /*
      BEST SELLERS
    */

    if (
      activeFilter === "bestsellers" &&
      product.is_best_seller
    ) {
      return {
        text: isArabic
          ? "الأكثر مبيعاً"
          : "Best Seller",
        type: "green",
      };
    }

    /*
      NEW ARRIVALS
    */

    if (
      activeFilter === "new" &&
      product.is_new_arrival
    ) {
      return {
        text: isArabic
          ? "جديد"
          : "New",
        type: "blue",
      };
    }

    /*
      TOP DEALS
    */

    if (
      activeFilter === "deals" &&
      product.is_top_deal
    ) {
      if (
        oldPrice > price &&
        oldPrice > 0
      ) {
        const discount = Math.round(
          ((oldPrice - price) /
            oldPrice) *
          100
        );

        return {
          text: isArabic
            ? `خصم ${discount}%`
            : `${discount}% OFF`,
          type: "pink",
        };
      }

      return {
        text: isArabic
          ? "عرض مميز"
          : "Top Deal",
        type: "pink",
      };
    }

    /*
      LOW STOCK
    */

    if (
      product.inventory_available &&
      Number(
        product.inventory_quantity
      ) <= 2 &&
      Number(
        product.inventory_quantity
      ) > 0
    ) {
      return {
        text: isArabic
          ? `متبقي ${product.inventory_quantity} فقط`
          : `Only ${product.inventory_quantity} Left`,
        type: "orange",
      };
    }

    return null;
  }

  /* ========================================
     PRODUCT SPECS
  ======================================== */

  function getProductSpecs(product) {
    const specs = [];

    if (
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      const variant =
        product.variants[0];

      const variantName = isArabic
        ? variant.name_ar
        : variant.name_en;

      if (variantName) {
        specs.push(variantName);
      }
    }

    if (
      Array.isArray(product.colors) &&
      product.colors.length > 0
    ) {
      const color =
        product.colors[0];

      const colorName = isArabic
        ? color.name_ar
        : color.name_en;

      if (colorName) {
        specs.push(colorName);
      }
    }

    if (
      product.brand_name_en ||
      product.brand_name_ar
    ) {
      specs.push(
        isArabic
          ? product.brand_name_ar
          : product.brand_name_en
      );
    }

    return specs.length > 0
      ? specs.join(" • ")
      : isArabic
        ? "جهاز ذكي"
        : "Smart Device";
  }

  /* ========================================
     PRICE
  ======================================== */

  function formatPrice(price) {
    return `$${Number(
      price || 0
    ).toLocaleString()}`;
  }

  /* ========================================
     DISPLAY PRODUCTS
  ======================================== */

  const displayProducts =
    filteredProducts.map(
      (product, index) => {
        const badge =
          getProductBadge(product);

        return {
          ...product,

          displayName: isArabic
            ? product.name_ar
            : product.name_en,

          specs:
            getProductSpecs(product),

          price:
            formatPrice(product.price),

          oldPrice:
            product.old_price &&
              Number(
                product.old_price
              ) >
              Number(
                product.price
              )
              ? formatPrice(
                product.old_price
              )
              : null,

          image:
            getProductImage(
              product,
              index
            ),

          badge: badge?.text,
          badgeType: badge?.type,
        };
      }
    );

  return (
    <section
      className={`product-section ${isArabic ? "rtl" : "ltr"
        }`}
      dir={
        isArabic ? "rtl" : "ltr"
      }
      aria-labelledby="product-section-title"
    >
      {/* =========================
          TOP BAR
      ========================= */}

      <div className="product-topbar">
        <div className="product-heading">
          <span className="product-eyebrow">
            {current.eyebrow}
          </span>

          <h2 id="product-section-title">
            {current.title}
          </h2>
        </div>

        <div className="product-controls">

          {/* FILTER TABS */}

          <div
            className="filter-tabs"
            role="tablist"
          >
            {current.filters.map(
              (filter) => (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={
                    activeFilter ===
                    filter.id
                  }
                  className={`filter-tab ${activeFilter ===
                      filter.id
                      ? "active"
                      : ""
                    }`}
                  onClick={() =>
                    setActiveFilter(
                      filter.id
                    )
                  }
                >
                  {filter.label}
                </button>
              )
            )}
          </div>

          {/* VIEW MORE */}

          <button
            type="button"
            className="view-more"
            onClick={onViewMore}
          >
            <span>
              {current.viewMore}
            </span>

            <ArrowIcon />
          </button>
        </div>
      </div>

      {/* =========================
          LOADING
      ========================= */}

      {/* =========================
    LOADING
========================= */}

      {loading && (
        <div className="product-grid">
          {[1, 2, 3, 4].map((item) => (
            <article
              key={item}
              className="product-card loading-card"
              aria-hidden="true"
            >
              <div className="product-card-top">
                <div className="loading-badge" />
                <div className="loading-heart" />
              </div>

              <div className="product-image-wrap">
                <div className="loading-image" />
              </div>

              <div className="product-info">
                <div className="loading-title" />
                <div className="loading-specs" />

                <div className="product-price-row">
                  <div className="loading-price" />
                </div>
              </div>

              <div className="loading-cart" />
            </article>
          ))}
        </div>
      )}

      {/* =========================
          ERROR
      ========================= */}

      {!loading && error && (
        <div className="product-info">
          <p>{error}</p>

          <button
            type="button"
            className="add-cart-button"
            onClick={fetchProducts}
          >
            {current.retry}
          </button>
        </div>
      )}

      {/* =========================
          EMPTY
      ========================= */}

      {!loading &&
        !error &&
        displayProducts.length ===
        0 && (
          <div className="product-info">
            <p>
              {current.noProducts}
            </p>
          </div>
        )}

      {/* =========================
          PRODUCT GRID
      ========================= */}

      {!loading &&
        !error &&
        displayProducts.length >
        0 && (
          <div className="product-grid">
            {displayProducts.map(
              (product) => (
                <article
                  key={product.id}
                  className="product-card"
                  onClick={() =>
                    onProductClick?.(
                      product.id
                    )
                  }
                >
                  {/* CARD TOP */}

                  <div className="product-card-top">

                    {product.badge ? (
                      <span
                        className={`product-badge ${product.badgeType}`}
                      >
                        {product.badge}
                      </span>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      className="product-wishlist"
                      aria-label={
                        isArabic
                          ? "إضافة للمفضلة"
                          : "Add to wishlist"
                      }
                      onClick={(
                        event
                      ) => {
                        event.stopPropagation();

                        onWishlist?.(
                          product.id
                        );
                      }}
                    >
                      <HeartIcon />
                    </button>
                  </div>

                  {/* PRODUCT IMAGE */}

                  <div className="product-image-wrap">
                    <img
                      src={product.image}
                      alt={
                        product.displayName
                      }
                      className="product-image"
                    />
                  </div>

                  {/* PRODUCT INFO */}

                  <div className="product-info">
                    <h3>
                      {
                        product.displayName
                      }
                    </h3>

                    <p className="product-specs">
                      {product.specs}
                    </p>

                    {/* PRICE */}

                    <div className="product-price-row">

                      <span className="product-price">
                        {product.price}
                      </span>

                      {product.oldPrice && (
                        <span className="product-old-price">
                          {
                            product.oldPrice
                          }
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ADD TO CART */}

                  <button
                    type="button"
                    className="add-cart-button"
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();

                      onAddToCart?.(
                        product.id
                      );
                    }}
                  >
                    <CartIcon />

                    <span>
                      {
                        current.addToCart
                      }
                    </span>
                  </button>
                </article>
              )
            )}
          </div>
        )}
    </section>
  );
}

/* ========================================
   HEART ICON
======================================== */

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.5 8.8c0 5-8.5 10.3-8.5 10.3S3.5 13.8 3.5 8.8A4.3 4.3 0 0 1 12 6.4a4.3 4.3 0 0 1 8.5 2.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ========================================
   CART ICON
======================================== */

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 5h2l1.6 9.2a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 1.9-1.4L21 8H7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="10"
        cy="19"
        r="1.3"
        fill="currentColor"
      />

      <circle
        cx="18"
        cy="19"
        r="1.3"
        fill="currentColor"
      />
    </svg>
  );
}

/* ========================================
   ARROW ICON
======================================== */

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 12h14M14 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}