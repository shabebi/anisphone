import React from "react";
import "./ProductSection.css";

import titaniumImage from "../assets/titanium-pro-max-5g.png";
import foldableImage from "../assets/foldable-ultra-2025.png";
import ceramicImage from "../assets/ceramic-edition-flagship.png";
import desertGoldImage from "../assets/desert-gold-studio-edition.png";

export default function ProductSection({
  language = "en",
  onProductClick,
  onAddToCart,
  onWishlist,
  onViewMore,
}) {
  const isArabic = language === "ar";

  const content = {
    en: {
      eyebrow: "SEASONAL CURATED SELECTION",
      title: "Latest Smart Devices & Exclusive Offers",

      filters: [
        { id: "all", label: "All" },
        { id: "bestsellers", label: "Best Sellers" },
        { id: "new", label: "New Arrivals" },
        { id: "deals", label: "Top Deals" },
      ],

      viewMore: "View More",
      addToCart: "Add to Cart",

      products: [
        {
          id: "titanium-pro-max-5g",
          badge: "Best Seller",
          badgeType: "green",
          name: "Titanium Pro Max 5G",
          specs: '512GB • Desert Titanium • 6.8" Screen',
          price: "$4,299",
          oldPrice: "$4,799",
          image: titaniumImage,
        },

        {
          id: "foldable-ultra-2025",
          badge: "New 2025",
          badgeType: "blue",
          name: "Foldable Ultra 2025",
          specs: "1TB • Ultra-Hinge Design • Dual Screen",
          price: "$6,499",
          oldPrice: null,
          image: foldableImage,
        },

        {
          id: "ceramic-edition-flagship",
          badge: "15% OFF",
          badgeType: "pink",
          name: "Ceramic Edition Flagship",
          specs: "256GB • Silver Ceramic • Cinematic Camera",
          price: "$3,899",
          oldPrice: "$4,399",
          image: ceramicImage,
        },

        {
          id: "desert-gold-studio-edition",
          badge: "Only 2 Left",
          badgeType: "orange",
          name: "Desert Gold Studio Edition",
          specs: "512GB • Sapphire Crystal Lenses",
          price: "$4,599",
          oldPrice: null,
          image: desertGoldImage,
        },
      ],
    },

    ar: {
      eyebrow: "مختارات الموسم المميزة",
      title: "أحدث الأجهزة الذكية والعروض الحصرية",

      filters: [
        { id: "all", label: "الكل" },
        { id: "bestsellers", label: "الأكثر مبيعاً" },
        { id: "new", label: "الواصل حديثاً" },
        { id: "deals", label: "أفضل العروض" },
      ],

      viewMore: "عرض المزيد",
      addToCart: "إضافة للسلة",

      products: [
        {
          id: "titanium-pro-max-5g",
          badge: "الأكثر مبيعاً",
          badgeType: "green",
          name: "Titanium Pro Max 5G",
          specs: 'سعة 512GB • تيتانيوم ذهبي • شاشة 6.8 بوصة',
          price: "$4,299",
          oldPrice: "$4,799",
          image: titaniumImage,
        },

        {
          id: "foldable-ultra-2025",
          badge: "جديد 2025",
          badgeType: "blue",
          name: "Foldable Ultra 2025",
          specs: "سعة 1TB • تصميم مفصل فائق • شاشة مزدوجة",
          price: "$6,499",
          oldPrice: null,
          image: foldableImage,
        },

        {
          id: "ceramic-edition-flagship",
          badge: "خصم 15%",
          badgeType: "pink",
          name: "Ceramic Edition Flagship",
          specs: "سعة 256GB • سيراميك فضي • كاميرا سينمائية",
          price: "$3,899",
          oldPrice: "$4,399",
          image: ceramicImage,
        },

        {
          id: "desert-gold-studio-edition",
          badge: "متبقي 2 فقط",
          badgeType: "orange",
          name: "Desert Gold Studio Edition",
          specs: "سعة 512GB • عدسات Sapphire Crystal",
          price: "$4,599",
          oldPrice: null,
          image: desertGoldImage,
        },
      ],
    },
  };

  const current = isArabic ? content.ar : content.en;

  return (
    <section
      className={`product-section ${isArabic ? "rtl" : "ltr"}`}
      dir={isArabic ? "rtl" : "ltr"}
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

          <div className="filter-tabs" role="tablist">
            {current.filters.map((filter, index) => (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={index === 0}
                className={`filter-tab ${
                  index === 0 ? "active" : ""
                }`}
                onClick={() =>
                  console.log("Filter:", filter.id)
                }
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* VIEW MORE */}

          <button
            type="button"
            className="view-more"
            onClick={onViewMore}
          >
            <span>{current.viewMore}</span>
            <ArrowIcon />
          </button>
        </div>
      </div>


      {/* =========================
          PRODUCTS
      ========================= */}

      <div className="product-grid">
        {current.products.map((product) => (
          <article
            key={product.id}
            className="product-card"
            onClick={() =>
              onProductClick?.(product.id)
            }
          >

            {/* CARD TOP */}

            <div className="product-card-top">

              <span
                className={`product-badge ${product.badgeType}`}
              >
                {product.badge}
              </span>

              <button
                type="button"
                className="product-wishlist"
                aria-label={
                  isArabic
                    ? "إضافة للمفضلة"
                    : "Add to wishlist"
                }
                onClick={(event) => {
                  event.stopPropagation();
                  onWishlist?.(product.id);
                }}
              >
                <HeartIcon />
              </button>

            </div>


            {/* PRODUCT IMAGE */}

            <div className="product-image-wrap">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
            </div>


            {/* PRODUCT INFO */}

            <div className="product-info">

              <h3>{product.name}</h3>

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
                    {product.oldPrice}
                  </span>
                )}

              </div>

            </div>


            {/* ADD TO CART */}

            <button
              type="button"
              className="add-cart-button"
              onClick={(event) => {
                event.stopPropagation();
                onAddToCart?.(product.id);
              }}
            >
              <CartIcon />

              <span>
                {current.addToCart}
              </span>
            </button>

          </article>
        ))}
      </div>
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