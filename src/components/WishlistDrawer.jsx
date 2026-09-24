import React, { useEffect, useState } from "react";
import "./WishlistDrawer.css";

const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/v1"
    : "https://anisphone.onrender.com/api/v1";

export default function WishlistDrawer({
  open,
  onClose,
  wishlist,
  setWishlist,
  language = "en",
  onAddToCart,
}) {
  const isArabic = language === "ar";

  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const text = isArabic
    ? {
        title: "المفضلة",
        eyebrow: "أنيس فون",
        empty: "قائمة المفضلة فارغة",
        emptyText: "احفظ المنتجات التي تعجبك هنا للرجوع إليها لاحقاً.",
        close: "إغلاق",
        remove: "إزالة من المفضلة",
        add: "أضف إلى السلة",
        loading: "جاري التحميل...",
        error: "حدث خطأ. حاول مرة أخرى.",
        saved: "منتج محفوظ",
      }
    : {
        title: "Wishlist",
        eyebrow: "ANIS PHONE",
        empty: "Your wishlist is empty",
        emptyText: "Save products you love here and come back to them later.",
        close: "Close",
        remove: "Remove from wishlist",
        add: "Add to cart",
        loading: "Loading...",
        error: "Something went wrong. Please try again.",
        saved: "saved items",
      };

  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem("anis_token");

    if (!token) return;

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.message || text.error);
        }

        return result;
      })
      .then((result) => {
        const data = result.data;

        if (Array.isArray(data)) {
          setWishlist?.(data);
        } else if (Array.isArray(data?.items)) {
          setWishlist?.(data.items);
        } else {
          setWishlist?.([]);
        }
      })
      .catch(() => {
        setError(text.error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open]);

  const items = Array.isArray(wishlist)
    ? wishlist
    : Array.isArray(wishlist?.items)
      ? wishlist.items
      : [];

  const getProduct = (item) => item.product || item;

  const getId = (item) => {
    const product = getProduct(item);

    return (
      product.product_id ||
      product.id ||
      item.product_id ||
      item.id
    );
  };

  const getName = (item) => {
    const product = getProduct(item);

    return isArabic
      ? product.name_ar ||
          product.product_name_ar ||
          product.name_en ||
          product.product_name_en ||
          "منتج"
      : product.name_en ||
          product.product_name_en ||
          product.name_ar ||
          product.product_name_ar ||
          "Product";
  };

  const getImage = (item) => {
    const product = getProduct(item);

    return (
      product.image_url ||
      product.primary_image ||
      product.product_image ||
      product.image ||
      product.images?.[0]?.image_url ||
      ""
    );
  };

  const getPrice = (item) => {
    const product = getProduct(item);

    return Number(
      product.price ??
        product.product_price ??
        product.current_price ??
        0
    );
  };

  const getOldPrice = (item) => {
    const product = getProduct(item);

    const oldPrice = Number(
      product.old_price ??
        product.product_old_price ??
        0
    );

    return oldPrice > getPrice(item) ? oldPrice : null;
  };

  const formatPrice = (price) =>
    `$${Number(price).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  async function removeItem(productId) {
    const token = localStorage.getItem("anis_token");

    if (!token || !productId) return;

    setActionId(productId);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/favorites/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || text.error);
      }

      setWishlist?.((current) =>
        Array.isArray(current)
          ? current.filter(
              (item) => getId(item) !== productId
            )
          : []
      );
    } catch (err) {
      setError(err.message || text.error);
    } finally {
      setActionId(null);
    }
  }

  async function addToCart(item) {
    const productId = getId(item);

    if (!productId) return;

    if (onAddToCart) {
      await onAddToCart(productId, {
        product: getProduct(item),
      });
      return;
    }

    const token = localStorage.getItem("anis_token");

    if (!token) return;

    setActionId(productId);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/cart/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            quantity: 1,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || text.error);
      }
    } catch (err) {
      setError(err.message || text.error);
    } finally {
      setActionId(null);
    }
  }

  if (!open) return null;

  return (
    <div
      className={`wishlist-overlay ${
        isArabic ? "rtl" : "ltr"
      }`}
      onClick={onClose}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <aside
        className="wishlist-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="wishlist-header">
          <div>
            <span className="wishlist-eyebrow">
              {text.eyebrow}
            </span>

            <h2>{text.title}</h2>

            {items.length > 0 && (
              <p>
                {items.length} {text.saved}
              </p>
            )}
          </div>

          <button
            type="button"
            className="wishlist-close"
            onClick={onClose}
            aria-label={text.close}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="wishlist-error">
            {error}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-spinner" />
            <p>{text.loading}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <HeartIcon />
            </div>

            <h3>{text.empty}</h3>

            <p>{text.emptyText}</p>

            <button
              type="button"
              className="wishlist-empty-button"
              onClick={onClose}
            >
              {text.close}
            </button>
          </div>
        ) : (
          <div className="wishlist-items">
            {items.map((item) => {
              const productId = getId(item);
              const image = getImage(item);
              const price = getPrice(item);
              const oldPrice = getOldPrice(item);
              const busy = actionId === productId;

              return (
                <article
                  className="wishlist-item"
                  key={productId}
                >
                  <div className="wishlist-item-image">
                    {image ? (
                      <img
                        src={image}
                        alt={getName(item)}
                      />
                    ) : (
                      <div className="wishlist-no-image">
                        📱
                      </div>
                    )}
                  </div>

                  <div className="wishlist-item-content">
                    <div className="wishlist-item-top">
                      <h3>{getName(item)}</h3>

                      <button
                        type="button"
                        className="wishlist-remove"
                        disabled={busy}
                        onClick={() =>
                          removeItem(productId)
                        }
                        aria-label={text.remove}
                      >
                        <HeartIcon filled />
                      </button>
                    </div>

                    <div className="wishlist-price">
                      <strong>
                        {formatPrice(price)}
                      </strong>

                      {oldPrice && (
                        <span>
                          {formatPrice(oldPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="wishlist-add"
                      disabled={busy}
                      onClick={() =>
                        addToCart(item)
                      }
                    >
                      {busy ? text.loading : text.add}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}

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