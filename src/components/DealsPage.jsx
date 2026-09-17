import { useEffect, useState } from "react";
import "./DealsPage.css";

const API = "http://localhost:5000/api/v1";

export default function DealsPage({
  language = "en",
  onProductClick,
  onWishlist,
}) {
  const ar = language === "ar";

  const [items, setItems] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  /* =========================================================
     LOAD DEALS
  ========================================================= */

  useEffect(() => {
    fetch(`${API}/products?limit=100`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        return response.json();
      })
      .then((result) => {
        const products = result.data || [];

        const topDeals = products.filter(
          (product) => product.is_top_deal === true
        );

        setItems(topDeals);
      })
      .catch((error) => {
        console.error("Deals error:", error);
      });
  }, []);

  /* =========================================================
     LOAD WISHLIST
  ========================================================= */

  useEffect(() => {
    const token = localStorage.getItem("anis_token");

    if (!token) {
      setWishlistIds(new Set());
      return;
    }

    fetch(`${API}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message || "Failed to load wishlist"
          );
        }

        return result;
      })
      .then((result) => {
        const data = result.data;

        const wishlist = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];

        const ids = new Set();

        wishlist.forEach((item) => {
          const product = item.product || item;

          const id =
            product?.product_id ||
            product?.id ||
            item?.product_id ||
            item?.productId;

          if (id) {
            ids.add(String(id));
          }
        });

        setWishlistIds(ids);
      })
      .catch((error) => {
        console.error("Deals wishlist error:", error);
      });
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  const getProductName = (product) => {
    return ar
      ? product.name_ar || product.name_en
      : product.name_en || product.name_ar;
  };

  const getProductImage = (product) => {
    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const primaryImage = product.images.find(
        (image) => image.is_primary
      );

      return (
        primaryImage?.image_url ||
        product.images[0]?.image_url ||
        ""
      );
    }

    return (
      product.image_url ||
      product.primary_image ||
      product.image ||
      ""
    );
  };

  const getDiscount = (product) => {
    const price = Number(product.price || 0);
    const oldPrice = Number(product.old_price || 0);

    if (oldPrice > price && oldPrice > 0) {
      return Math.round(
        ((oldPrice - price) / oldPrice) * 100
      );
    }

    return 0;
  };

  const isWishlisted = (productId) => {
    return wishlistIds.has(String(productId));
  };

  /* =========================================================
     WISHLIST
  ========================================================= */

  const handleWishlistClick = async (event, product) => {
    event.stopPropagation();

    const productId = product?.id;

    if (!productId) return;

    const token = localStorage.getItem("anis_token");

    if (!token) {
      onWishlist?.(productId);
      return;
    }

    const currentlyWishlisted = isWishlisted(productId);

    // Optimistic UI
    setWishlistIds((current) => {
      const next = new Set(current);

      if (currentlyWishlisted) {
        next.delete(String(productId));
      } else {
        next.add(String(productId));
      }

      return next;
    });

    try {
      await onWishlist?.(productId);
    } catch (error) {
      // Revert if parent wishlist request fails
      setWishlistIds((current) => {
        const next = new Set(current);

        if (currentlyWishlisted) {
          next.add(String(productId));
        } else {
          next.delete(String(productId));
        }

        return next;
      });

      console.error("Deals wishlist error:", error);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section
      className={`deals-page ${ar ? "rtl" : "ltr"}`}
      dir={ar ? "rtl" : "ltr"}
    >
      {/* =====================================================
          HERO
      ===================================================== */}

      <div className="deals-hero">
        <span>ANIS EXCLUSIVE</span>

        <h1>
          {ar
            ? "عروض تستحق الترقية"
            : "Deals worth the upgrade"}
        </h1>

        <p>
          {ar
            ? "أسعار خاصة على أحدث الأجهزة لفترة محدودة."
            : "Special prices on the devices you want, for a limited time."}
        </p>
      </div>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <div className="deals-grid">
        {items.map((product) => {
          const discount = getDiscount(product);
          const image = getProductImage(product);
          const wishlisted = isWishlisted(product.id);

          return (
            <article
              key={product.id}
              className="deal-card"
              onClick={() =>
                onProductClick?.(product.id)
              }
            >
              {/* CARD TOP */}

              <div className="deal-card-top">
                {discount > 0 ? (
                  <span className="deal-badge">
                    {discount}% OFF
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  className={`deal-wishlist ${
                    wishlisted ? "active" : ""
                  }`}
                  aria-label={
                    ar
                      ? wishlisted
                        ? "إزالة من المفضلة"
                        : "إضافة للمفضلة"
                      : wishlisted
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                  }
                  onClick={(event) =>
                    handleWishlistClick(event, product)
                  }
                >
                  <HeartIcon filled={wishlisted} />
                </button>
              </div>

              {/* PRODUCT IMAGE */}

              <div className="deal-image-wrap">
                {image ? (
                  <img
                    src={image}
                    alt={getProductName(product)}
                    className="deal-image"
                  />
                ) : (
                  <div className="deal-image-empty" />
                )}
              </div>

              {/* PRODUCT INFO */}

              <div className="deal-info">
                <h3>
                  {getProductName(product)}
                </h3>

                <p className="deal-brand">
                  {ar
                    ? product.brand_name_ar
                    : product.brand_name_en}
                </p>

                {/* PRICE */}

                <div className="deal-price-row">
                  <span className="deal-price">
                    $
                    {Number(
                      product.price || 0
                    ).toLocaleString()}
                  </span>

                  {Number(product.old_price || 0) >
                    Number(product.price || 0) && (
                    <span className="deal-old-price">
                      $
                      {Number(
                        product.old_price
                      ).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* VIEW DETAILS */}

              <button
                type="button"
                className="deal-details-button"
                onClick={(event) => {
                  event.stopPropagation();

                  onProductClick?.(product.id);
                }}
              >
                {ar
                  ? "عرض التفاصيل"
                  : "View Details"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
   HEART ICON
========================================================= */

function HeartIcon({ filled = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
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