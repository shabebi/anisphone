import React, { useEffect, useState } from "react";
import "./CartDrawer.css";

const API_BASE =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/v1"
    : "https://anisphone.onrender.com/api/v1";

export default function CartDrawer({
  open,
  onClose,
  cart,
  setCart,
  language = "en",
}) {
  const isArabic = language === "ar";
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  const text = isArabic
    ? {
        title: "سلة التسوق",
        empty: "سلتك فارغة",
        emptyText: "أضف بعض المنتجات إلى سلتك للبدء.",
        close: "إغلاق",
        delete: "حذف",
        decrease: "تقليل الكمية",
        increase: "زيادة الكمية",
        total: "الإجمالي",
        clear: "إفراغ السلة",
        whatsapp: "إرسال الطلب عبر واتساب",
        loading: "جاري التحميل...",
        error: "حدث خطأ. حاول مرة أخرى.",
        color: "اللون",
        variant: "الخيار",
        quantity: "الكمية",
      }
    : {
        title: "Your Cart",
        empty: "Your cart is empty",
        emptyText: "Add some products to your cart to get started.",
        close: "Close",
        delete: "Remove",
        decrease: "Decrease quantity",
        increase: "Increase quantity",
        total: "Total",
        clear: "Clear cart",
        whatsapp: "Send Order via WhatsApp",
        loading: "Loading...",
        error: "Something went wrong. Please try again.",
        color: "Color",
        variant: "Variant",
        quantity: "Quantity",
      };

  useEffect(() => {
    if (!open) return;

    const token = localStorage.getItem("anis_token");

    if (!token) return;

    setLoading(true);
    setError("");

    fetch(`${API_BASE}/cart`, {
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
        setCart?.(result.data || null);
      })
      .catch(() => {
        setError(text.error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open]);

  const items = Array.isArray(cart?.items) ? cart.items : [];

  const getPrice = (item) => {
    const price =
      item.variant_price !== null &&
      item.variant_price !== undefined
        ? item.variant_price
        : item.product_price ?? item.price ?? 0;

    return Number(price) || 0;
  };

  const getName = (item) => {
    return isArabic
      ? item.product_name_ar ||
          item.name_ar ||
          item.product_name_en ||
          item.name_en ||
          "منتج"
      : item.product_name_en ||
          item.name_en ||
          item.product_name_ar ||
          item.name_ar ||
          "Product";
  };

  const getImage = (item) => {
    return (
      item.image_url ||
      item.product_image ||
      item.image ||
      ""
    );
  };

  const getColor = (item) => {
    if (item.color_name_en || item.color_name_ar) {
      return isArabic
        ? item.color_name_ar || item.color_name_en
        : item.color_name_en || item.color_name_ar;
    }

    return null;
  };

  const getVariant = (item) => {
    if (item.variant_name_en || item.variant_name_ar) {
      return isArabic
        ? item.variant_name_ar || item.variant_name_en
        : item.variant_name_en || item.variant_name_ar;
    }

    return null;
  };

  const total = items.reduce(
    (sum, item) => sum + getPrice(item) * Number(item.quantity || 0),
    0
  );

  const formatPrice = (price) =>
    `$${Number(price).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;

  async function updateQuantity(item, quantity) {
    if (quantity < 1) {
      await removeItem(item.id);
      return;
    }

    const token = localStorage.getItem("anis_token");

    if (!token) return;

    setActionId(item.id);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/cart/items/${item.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || text.error);
      }

      setCart?.(result.data);
    } catch (err) {
      setError(err.message || text.error);
    } finally {
      setActionId(null);
    }
  }

  async function removeItem(itemId) {
    const token = localStorage.getItem("anis_token");

    if (!token) return;

    setActionId(itemId);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/cart/items/${itemId}`,
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

      setCart?.(result.data);
    } catch (err) {
      setError(err.message || text.error);
    } finally {
      setActionId(null);
    }
  }

  async function clearCart() {
    const token = localStorage.getItem("anis_token");

    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || text.error);
      }

      setCart?.(result.data);
    } catch (err) {
      setError(err.message || text.error);
    } finally {
      setLoading(false);
    }
  }

  async function sendViaWhatsApp() {
    if (!items.length) return;

    const token = localStorage.getItem("anis_token");

    if (!token) return;

    setLoading(true);
    setError("");

    const messageLines = [
      isArabic ? "مرحباً، أريد طلب المنتجات التالية:" : "Hello, I would like to order the following products:",
      "",
      ...items.map((item, index) => {
        const parts = [
          `${index + 1}. ${getName(item)}`,
          `${isArabic ? "الكمية" : "Qty"}: ${item.quantity}`,
          `${isArabic ? "السعر" : "Price"}: ${formatPrice(
            getPrice(item)
          )}`,
        ];

        const color = getColor(item);
        const variant = getVariant(item);

        if (color) {
          parts.push(`${text.color}: ${color}`);
        }

        if (variant) {
          parts.push(`${text.variant}: ${variant}`);
        }

        return parts.join(" | ");
      }),
      "",
      `${text.total}: ${formatPrice(total)}`,
    ];

    try {
      const response = await fetch(
        `${API_BASE}/orders/whatsapp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: messageLines.join("\n"),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || text.error);
      }

      if (result?.data?.whatsapp_url) {
        window.location.href = result.data.whatsapp_url;
        return;
      }

      if (result?.whatsapp_url) {
        window.location.href = result.whatsapp_url;
        return;
      }

      throw new Error(text.error);
    } catch (err) {
      setError(err.message || text.error);
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className={`cart-overlay ${isArabic ? "rtl" : "ltr"}`}
      onClick={onClose}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <aside
        className="cart-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cart-header">
          <div>
            <span className="cart-eyebrow">
              {isArabic ? "أنيس فون" : "ANIS PHONE"}
            </span>
            <h2>{text.title}</h2>
          </div>

          <button
            type="button"
            className="cart-close"
            onClick={onClose}
            aria-label={text.close}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="cart-error">
            {error}
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-spinner" />
            <p>{text.loading}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>{text.empty}</h3>
            <p>{text.emptyText}</p>
            <button
              type="button"
              className="cart-empty-button"
              onClick={onClose}
            >
              {text.close}
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => {
                const price = getPrice(item);
                const image = getImage(item);
                const busy = actionId === item.id;

                return (
                  <article
                    className="cart-item"
                    key={item.id}
                  >
                    <div className="cart-item-image">
                      {image ? (
                        <img
                          src={image}
                          alt={getName(item)}
                        />
                      ) : (
                        <div className="cart-no-image">
                          📱
                        </div>
                      )}
                    </div>

                    <div className="cart-item-content">
                      <div className="cart-item-top">
                        <div>
                          <h3>{getName(item)}</h3>

                          {getColor(item) && (
                            <p>
                              <span>{text.color}:</span>{" "}
                              {getColor(item)}
                            </p>
                          )}

                          {getVariant(item) && (
                            <p>
                              <span>{text.variant}:</span>{" "}
                              {getVariant(item)}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          className="cart-delete"
                          disabled={busy}
                          onClick={() =>
                            removeItem(item.id)
                          }
                          aria-label={text.delete}
                        >
                          <TrashIcon />
                        </button>
                      </div>

                      <div className="cart-item-bottom">
                        <div className="cart-quantity">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              updateQuantity(
                                item,
                                Number(item.quantity) - 1
                              )
                            }
                            aria-label={text.decrease}
                          >
                            −
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              updateQuantity(
                                item,
                                Number(item.quantity) + 1
                              )
                            }
                            aria-label={text.increase}
                          >
                            +
                          </button>
                        </div>

                        <strong>
                          {formatPrice(
                            price * Number(item.quantity || 0)
                          )}
                        </strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span>{text.total}</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              <button
                type="button"
                className="cart-whatsapp"
                disabled={loading}
                onClick={sendViaWhatsApp}
              >
                <WhatsAppIcon />
                <span>
                  {loading
                    ? text.loading
                    : text.whatsapp}
                </span>
              </button>

              <button
                type="button"
                className="cart-clear"
                disabled={loading}
                onClick={clearCart}
              >
                {text.clear}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a9.8 9.8 0 0 0-8.47 14.72L2 22l5.46-1.49A9.9 9.9 0 1 0 12 2Zm0 17.9a8 8 0 0 1-4.07-1.11l-.29-.17-3.24.89.87-3.15-.19-.31A8 8 0 1 1 12 19.9Zm4.39-5.98c-.24-.12-1.43-.71-1.65-.79-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.18-.7-.62-1.18-1.39-1.32-1.63-.14-.24-.01-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.09 3.62.57.25 1.02.4 1.37.51.58.18 1.11.15 1.53.09.47-.07 1.43-.58 1.63-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}