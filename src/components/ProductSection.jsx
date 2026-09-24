import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ProductSection.css";

import logoImage from "../assets/logo.png";

const API_URL = "http://localhost:5000/api/v1";

const fallbackImages = [logoImage];

/* =========================================================
   RESPONSIVE CAROUSEL
========================================================= */

function getResponsiveVisibleCount() {
  if (typeof window === "undefined") {
    return 4;
  }

  if (window.innerWidth <= 600) {
    return 1;
  }

  if (window.innerWidth <= 1000) {
    return 2;
  }

  return 4;
}

export default function ProductSection({
  language = "en",
  onProductClick,
  onAddToCart,
  onWishlist,
  onViewMore,
}) {
  const isArabic = language === "ar";

  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("bestsellers");

  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselTransitioning, setIsCarouselTransitioning] = useState(false);
  const [carouselStep, setCarouselStep] = useState(0);
  const carouselViewportRef = useRef(null);

  const [visibleCount, setVisibleCount] = useState(
    getResponsiveVisibleCount()
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlistIds, setWishlistIds] = useState(new Set());

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

      viewMore: "View All Products",
      viewDetails: "View Details",

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

      viewMore: "عرض جميع المنتجات",
      viewDetails: "عرض التفاصيل",

      loading: "جاري تحميل المنتجات...",
      error: "تعذر تحميل المنتجات.",
      retry: "حاول مرة أخرى",
      noProducts: "لا توجد منتجات.",
    },
  };

  const current = isArabic ? content.ar : content.en;

  /* =========================================================
     RESPONSIVE BREAKPOINT
  ========================================================= */

  useEffect(() => {
    let resizeTimer;

    function handleResize() {
      clearTimeout(resizeTimer);

      resizeTimer = setTimeout(() => {
        const nextCount = getResponsiveVisibleCount();

        setVisibleCount((currentCount) => {
          if (currentCount === nextCount) {
            return currentCount;
          }

          return nextCount;
        });
      }, 80);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/products`);

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

  /* =========================================================
     LOAD WISHLIST
  ========================================================= */

  useEffect(() => {
    async function loadWishlist() {
      try {
        const token = localStorage.getItem("anis_token");

        if (!token) {
          setWishlistIds(new Set());
          return;
        }

        const response = await fetch(`${API_URL}/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error(
            "Wishlist request failed:",
            response.status
          );

          setWishlistIds(new Set());
          return;
        }

        const result = await response.json();

        const favorites = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        const ids = new Set();

        favorites.forEach((item) => {
          const productId =
            item?.product_id ??
            item?.productId ??
            item?.product?.id ??
            item?.product?.product_id;

          if (productId) {
            ids.add(String(productId));
          }
        });

        setWishlistIds(ids);
      } catch (err) {
        console.error("Wishlist load error:", err);
        setWishlistIds(new Set());
      }
    }

    loadWishlist();
  }, []);

  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

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
            Number(a.best_seller_order || 999) -
            Number(b.best_seller_order || 999)
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
            Number(a.new_arrival_order || 999) -
            Number(b.new_arrival_order || 999)
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
            Number(a.top_deal_order || 999) -
            Number(b.top_deal_order || 999)
        );
    }

    return result;
  }, [products, activeFilter]);

  // Preload and decode every product image before it is needed by the carousel.
  useEffect(() => {
    let cancelled = false;

    async function preloadImages() {
      const urls = filteredProducts
        .map((product) => {
          const primary = Array.isArray(product.images)
            ? product.images.find((image) => image.is_primary)
            : null;
          return primary?.image_url || product.images?.[0]?.image_url;
        })
        .filter(Boolean);

      await Promise.all(
        urls.map((url) =>
          new Promise((resolve) => {
            const image = new Image();
            image.onload = async () => {
              try {
                if (image.decode) await image.decode();
              } catch {}
              resolve();
            };
            image.onerror = resolve;
            image.src = url;
          })
        )
      );

      if (cancelled) return;
    }

    preloadImages();
    return () => {
      cancelled = true;
    };
  }, [filteredProducts]);

  /* =========================================================
     CAROUSEL
  ========================================================= */

  const totalProducts = filteredProducts.length;

  const actualVisibleCount = Math.min(
    visibleCount,
    totalProducts
  );

  const carouselEnabled =
    totalProducts > actualVisibleCount;

  // Keep clones at both ends. This means the browser ALWAYS has the
  // next/previous product already mounted before the transform starts.
  const carouselProducts = useMemo(() => {
    if (!totalProducts) return [];
    if (!carouselEnabled) return filteredProducts;

    const before = filteredProducts.slice(-actualVisibleCount);
    const after = filteredProducts.slice(0, actualVisibleCount);

    return [...before, ...filteredProducts, ...after];
  }, [filteredProducts, totalProducts, actualVisibleCount, carouselEnabled]);

  const carouselBaseIndex = carouselEnabled
    ? actualVisibleCount
    : 0;

  // Measure the real card step in pixels. Using a measured pixel value
  // avoids browser calc()/percentage interpolation differences on phones.
  useEffect(() => {
    const viewport = carouselViewportRef.current;
    if (!viewport || !actualVisibleCount) {
      setCarouselStep(0);
      return;
    }

    const updateStep = () => {
      const width = viewport.getBoundingClientRect().width;
      const gap = parseFloat(
        getComputedStyle(viewport.parentElement).getPropertyValue("--carousel-gap")
      ) || 0;

      setCarouselStep(
        (width + gap) / actualVisibleCount
      );
    };

    updateStep();

    const observer = new ResizeObserver(updateStep);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, [actualVisibleCount, visibleCount]);

  // Reset to the real first product whenever the filter, language, or
  // responsive card count changes.
  useEffect(() => {
    setIsCarouselTransitioning(false);
    setCarouselIndex(
      totalProducts > actualVisibleCount
        ? actualVisibleCount
        : 0
    );
  }, [activeFilter, language, visibleCount, totalProducts, actualVisibleCount]);

  function moveCarousel(direction) {
    if (!carouselEnabled || isCarouselTransitioning) return;

    setIsCarouselTransitioning(true);

    setCarouselIndex((current) =>
      direction === "next" ? current + 1 : current - 1
    );
  }

  function handleCarouselTransitionEnd(event) {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "transform") return;
    if (!isCarouselTransitioning || !carouselEnabled) return;

    const lastRealIndex =
      carouselBaseIndex + totalProducts - 1;

    if (carouselIndex > lastRealIndex) {
      setIsCarouselTransitioning(false);
      setCarouselIndex(carouselBaseIndex);
      return;
    }

    if (carouselIndex < carouselBaseIndex) {
      setIsCarouselTransitioning(false);
      setCarouselIndex(
        carouselBaseIndex + totalProducts - 1
      );
      return;
    }

    setIsCarouselTransitioning(false);
  }

  /* =========================================================
     PRODUCT IMAGE
  ========================================================= */

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

  /* =========================================================
     PRODUCT BADGE
  ========================================================= */

  function getProductBadge(product) {
    const price = Number(product.price || 0);
    const oldPrice = Number(product.old_price || 0);

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

    if (
      activeFilter === "new" &&
      product.is_new_arrival
    ) {
      return {
        text: isArabic ? "جديد" : "New",
        type: "blue",
      };
    }

    if (
      activeFilter === "deals" &&
      product.is_top_deal
    ) {
      if (oldPrice > price && oldPrice > 0) {
        const discount = Math.round(
          ((oldPrice - price) / oldPrice) * 100
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

    if (
      product.inventory_available &&
      Number(product.inventory_quantity) <= 2 &&
      Number(product.inventory_quantity) > 0
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

  /* =========================================================
     PRODUCT SPECS
  ========================================================= */

  function getProductSpecs(product) {
    const specs = [];

    if (
      Array.isArray(product.variants) &&
      product.variants.length > 0
    ) {
      const variant = product.variants[0];

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
      const color = product.colors[0];

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

  /* =========================================================
     PRICE
  ========================================================= */

  function formatPrice(price) {
    return `$${Number(
      price || 0
    ).toLocaleString()}`;
  }

  /* =========================================================
     WISHLIST
  ========================================================= */

  function isProductWishlisted(productId) {
    return wishlistIds.has(String(productId));
  }

  function handleWishlistClick(event, productId) {
    event.stopPropagation();

    const id = String(productId);

    const currentlyWishlisted =
      wishlistIds.has(id);

    setWishlistIds((current) => {
      const next = new Set(current);

      if (currentlyWishlisted) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

    onWishlist?.(productId);
  }

  /* =========================================================
     DISPLAY PRODUCTS
  ========================================================= */

  const displayProducts =
    carouselProducts.map(
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
              Number(product.old_price) >
              Number(product.price)
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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      className={`product-section ${isArabic ? "rtl" : "ltr"
        }`}
      dir={isArabic ? "rtl" : "ltr"}
      aria-labelledby="product-section-title"
    >
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
                  onClick={() => {
                    if (
                      activeFilter !==
                      filter.id
                    ) {
                      setActiveFilter(
                        filter.id
                      );
                    }
                  }}
                >
                  {filter.label}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className="view-more"
            onClick={() =>
              onViewMore?.("all")
            }
          >
            <span>
              {current.viewMore}
            </span>

            <ArrowIcon />
          </button>

        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="product-grid">
          {[1, 2, 3, 4].map(
            (item) => (
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
            )
          )}
        </div>
      )}

      {/* ERROR */}

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

      {/* EMPTY */}

      {!loading &&
        !error &&
        displayProducts.length === 0 && (
          <div className="product-info">
            <p>
              {current.noProducts}
            </p>
          </div>
        )}

      {/* PRODUCT CAROUSEL */}

      {!loading &&
        !error &&
        displayProducts.length > 0 && (
          <div className="product-carousel">

            {carouselEnabled && (
              <>
                <button
                  type="button"
                  className="product-carousel-arrow product-carousel-arrow-left"
                  aria-label={
                    isArabic
                      ? "المنتجات السابقة"
                      : "Previous products"
                  }
                  onClick={() =>
                    moveCarousel("prev")
                  }
                >
                  <ChevronLeftIcon />
                </button>

                <button
                  type="button"
                  className="product-carousel-arrow product-carousel-arrow-right"
                  aria-label={
                    isArabic
                      ? "المنتجات التالية"
                      : "Next products"
                  }
                  onClick={() =>
                    moveCarousel("next")
                  }
                >
                  <ChevronRightIcon />
                </button>
              </>
            )}

            <div
              className="product-carousel-viewport"
              ref={carouselViewportRef}
            >

              <div
                className="product-grid product-carousel-track"
                style={{
                  "--carousel-step": carouselEnabled
                    ? `calc((100% + var(--carousel-gap)) / ${actualVisibleCount})`
                    : "0px",
                  transform: carouselEnabled
                    ? `translate3d(${-carouselStep * carouselIndex}px, 0, 0)`
                    : "translate3d(0, 0, 0)",
                  transition: isCarouselTransitioning
                    ? "transform 380ms cubic-bezier(0.22, 0.61, 0.36, 1)"
                    : "none",
                }}
                onTransitionEnd={handleCarouselTransitionEnd}
              >

                {displayProducts.map(
                  (product, index) => {
                    const wishlisted =
                      isProductWishlisted(
                        product.id
                      );

                    return (
                      <article
                        key={`${product.id}-${index}`}
                        className="product-card"
                        onClick={() =>
                          onProductClick?.(
                            product.id
                          )
                        }
                      >

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
                            className={`product-wishlist ${wishlisted
                                ? "active"
                                : ""
                              }`}
                            aria-label={
                              wishlisted
                                ? isArabic
                                  ? "إزالة من المفضلة"
                                  : "Remove from wishlist"
                                : isArabic
                                  ? "إضافة للمفضلة"
                                  : "Add to wishlist"
                            }
                            aria-pressed={
                              wishlisted
                            }
                            onClick={(event) =>
                              handleWishlistClick(
                                event,
                                product.id
                              )
                            }
                          >
                            <HeartIcon
                              filled={
                                wishlisted
                              }
                            />
                          </button>

                        </div>

                        <div className="product-image-wrap">
                          <img
                            src={product.image}
                            alt={
                              product.displayName
                            }
                            className="product-image"
                            loading="eager"
                            decoding="async"
                            draggable="false"
                          />
                        </div>

                        <div className="product-info">

                          <h3>
                            {
                              product.displayName
                            }
                          </h3>

                          <p className="product-specs">
                            {product.specs}
                          </p>

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

                        <button
                          type="button"
                          className="add-cart-button"
                          onClick={(event) => {
                            event.stopPropagation();

                            onProductClick?.(
                              product.id
                            );
                          }}
                        >
                          <span>
                            {
                              current.viewDetails
                            }
                          </span>
                        </button>

                      </article>
                    );
                  }
                )}

              </div>
            </div>
          </div>
        )}
    </section>
  );
}


/* =========================================================
   ICONS
========================================================= */

function HeartIcon({ filled = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={
        filled
          ? "currentColor"
          : "none"
      }
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

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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