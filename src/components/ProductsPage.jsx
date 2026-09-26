import { useCallback, useEffect, useMemo, useState } from "react";
import "./ProductsPage.css";

const API =
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/v1"
    : "https://anisphone.onrender.com/api/v1";

const clean = {
  brand: "",
  color: "",
  min: "",
  max: "",
};

export default function ProductsPage({
  language = "en",
  initialCategory = "all",
  initialBrand = "",
  dealsOnly = false,
  onProductClick,
  onAddToCart,
  onWishlist,
}) {
  const ar = language === "ar";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  const [category, setCategory] = useState(initialCategory || "all");
  const [filters, setFilters] = useState({
    ...clean,
    brand: initialBrand || "",
  });

  const [loading, setLoading] = useState(true);
  const [colorOpen, setColorOpen] = useState(false);

  const [wishlistIds, setWishlistIds] = useState(new Set());

  const t = ar
    ? {
      title: dealsOnly ? "العروض والخصومات" : "تسوق الأجهزة",
      all: "كل",
      filter: "تصفية المنتجات",
      clear: "مسح الكل",
      any: "كل",
      brand: "العلامة التجارية",
      color: "الألوان",
      price: "السعر",
      from: "من",
      to: "إلى",
      count: "منتجاً",
      loading: "جارٍ تحميل المنتجات...",
      empty: "لم نجد منتجات مطابقة لخياراتك.",
      details: "عرض التفاصيل",
      wish: "المفضلة",
      store: "متجر أنيس فون",
    }
    : {
      title: dealsOnly ? "Deals & Discounts" : "Shop Devices",
      all: "All",
      filter: "Filter products",
      clear: "Clear all",
      any: "Any",
      brand: "Brand",
      color: "Color",
      price: "Price",
      from: "From",
      to: "To",
      count: "products",
      loading: "Loading products...",
      empty: "We couldn't find products matching those filters.",
      details: "View details",
      wish: "Wishlist",
      store: "ANIS PHONE STORE",
    };

  useEffect(() => {
    setCategory(initialCategory || "all");
  }, [initialCategory]);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      brand: initialBrand || "",
    }));
  }, [initialBrand]);

  /*
   * Backend catalog:
   * - products
   * - categories
   * - active brands
   * - colors
   * - current product price range
   */
  const loadCatalog = useCallback(async (signal) => {
    try {
      setLoading(true);

      const [productsResponse, filtersResponse] = await Promise.all([
        fetch(`${API}/products?limit=100`, { signal }),
        fetch(`${API}/catalog/filters`, { signal }),
      ]);

      if (!productsResponse.ok || !filtersResponse.ok) {
        throw new Error("REQUEST_FAILED");
      }

      const productsResult = await productsResponse.json();
      const filtersResult = await filtersResponse.json();

      setProducts(productsResult.data || []);

      const catalog = filtersResult.data || {};

      setCategories(catalog.categories || []);
      setBrands(catalog.brands || []);
      setColors(
        (catalog.colors || []).map((color) => ({
          ...color,
          filterKey: String(
            color.hex_code || color.name_en || color.id || ""
          )
            .trim()
            .toLowerCase(),
        }))
      );

      setPriceRange({
        min: Number(catalog.price?.min || 0),
        max: Number(catalog.price?.max || 0),
      });
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Products page error:", error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    loadCatalog(controller.signal);

    return () => controller.abort();
  }, [loadCatalog]);

  /*
   * Refresh whenever the customer comes back to this page/tab.
   * This makes admin brand/category changes appear without a hard reload.
   */
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") {
        loadCatalog();
      }
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadCatalog]);

  /* ============================================================
     LOAD WISHLIST
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      try {
        const token = localStorage.getItem("anis_token");

        if (!token) {
          if (!cancelled) setWishlistIds(new Set());
          return;
        }

        const response = await fetch(`${API}/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (!cancelled) setWishlistIds(new Set());
          return;
        }

        const result = await response.json();

        const favorites = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        const ids = new Set();

        favorites.forEach((favorite) => {
          const productId =
            favorite?.product_id ??
            favorite?.productId ??
            favorite?.product?.id;

          if (productId) {
            ids.add(String(productId));
          }
        });

        if (!cancelled) setWishlistIds(ids);
      } catch (error) {
        if (!cancelled) {
          console.error("Wishlist load error:", error);
          setWishlistIds(new Set());
        }
      }
    }

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ============================================================
     FILTER OPTIONS
  ============================================================ */

  const options = useMemo(() => {
    return {
      brands: brands
        .map((brand) => [
          brand.slug,
          ar ? brand.name_ar : brand.name_en,
        ])
        .filter(([value]) => value),

      colors,
    };
  }, [brands, colors, ar]);

  /* ============================================================
     FILTERED PRODUCTS
  ============================================================ */

  const shown = useMemo(() => {
    return products.filter((product) => {
      const price = Number(product.price || 0);

      const productColors = [
        ...(product.colors || []),
        ...(product.variants || []).flatMap(
          (variant) => variant.colors || []
        ),
      ].map((color) =>
        String(
          color.hex_code ||
          color.name_en ||
          color.id ||
          ""
        )
          .trim()
          .toLowerCase()
      );

      const matchesCategory =
        category === "all" ||
        product.category_slug === category;

      const matchesBrand =
        !filters.brand ||
        product.brand_slug === filters.brand;

      const matchesColor =
        !filters.color ||
        productColors.includes(filters.color);

      const matchesMinPrice =
        !filters.min ||
        price >= Number(filters.min);

      const matchesMaxPrice =
        !filters.max ||
        price <= Number(filters.max);

      const matchesDeals =
        !dealsOnly ||
        Number(product.old_price) > price ||
        (product.offers || []).length > 0;

      return (
        matchesCategory &&
        matchesBrand &&
        matchesColor &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesDeals
      );
    });
  }, [
    products,
    category,
    filters,
    dealsOnly,
  ]);

  const set = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const name = (product) =>
    ar ? product.name_ar : product.name_en;

  const image = (product) =>
    product.images?.find((item) => item.is_primary)?.image_url ||
    product.images?.[0]?.image_url;

  function isWishlisted(productId) {
    return wishlistIds.has(String(productId));
  }

  function handleWishlistClick(event, productId) {
    event.stopPropagation();

    const id = String(productId);
    const wasWishlisted = wishlistIds.has(id);

    setWishlistIds((current) => {
      const next = new Set(current);

      if (wasWishlisted) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

    onWishlist?.(productId);
  }

  return (
    <section
      className={`catalog-page ${ar ? "rtl" : "ltr"}`}
      dir={ar ? "rtl" : "ltr"}
    >
      <div className="catalog-inner">
        <header className="catalog-header">
          <div>
            <span>{t.store}</span>
            <h1>{t.title}</h1>
          </div>

          <p>
            {shown.length} {t.count}
          </p>
        </header>

        {/* CATEGORIES — from backend */}
        <nav className="category-picker" aria-label="Categories">
          <button
            type="button"
            className={category === "all" ? "selected" : ""}
            onClick={() => setCategory("all")}
          >
            {t.all}
          </button>

          {categories.map((item) => (
            <button
              type="button"
              key={item.id || item.slug}
              className={
                category === item.slug ? "selected" : ""
              }
              onClick={() => setCategory(item.slug)}
            >
              {ar ? item.name_ar : item.name_en}
            </button>
          ))}
        </nav>

        <div className="catalog-filters">
          <div className="filter-title">
            <strong>{t.filter}</strong>

            <button
              type="button"
              onClick={() => {
                setFilters(clean);
                setColorOpen(false);
              }}
            >
              {t.clear}
            </button>
          </div>

          <div className="filter-row">
            {/* BRANDS — from backend */}
            <Select
              label={t.brand}
              value={filters.brand}
              items={options.brands}
              any={t.any}
              change={(value) => set("brand", value)}
            />

            {/* COLORS — from backend */}
            <ColorPicker
              label={t.color}
              any={t.any}
              colors={options.colors}
              isArabic={ar}
              value={filters.color}
              open={colorOpen}
              onToggle={() =>
                setColorOpen((current) => !current)
              }
              onChange={(value) => {
                set("color", value);
                setColorOpen(false);
              }}
            />

            {/* PRICE — backend provides current range, user chooses exact bounds */}
            <label className="price-filter">
              <span>{t.price}</span>

              <input
                type="number"
                min="0"
                max={priceRange.max || undefined}
                placeholder={
                  priceRange.min > 0
                    ? `${t.from} $${priceRange.min}`
                    : t.from
                }
                value={filters.min}
                onChange={(event) =>
                  set("min", event.target.value)
                }
              />

              <input
                type="number"
                min="0"
                max={priceRange.max || undefined}
                placeholder={
                  priceRange.max > 0
                    ? `${t.to} $${priceRange.max}`
                    : t.to
                }
                value={filters.max}
                onChange={(event) =>
                  set("max", event.target.value)
                }
              />
            </label>
          </div>
        </div>

        {loading ? (
          <div className="catalog-loading">
            {t.loading}
          </div>
        ) : shown.length ? (
          <div className="catalog-grid">
            {shown.map((product) => {
              const wishlisted = isWishlisted(product.id);

              return (
                <article
                  className="catalog-card"
                  key={product.id}
                >
                  <button
                    type="button"
                    className="catalog-image"
                    onClick={() =>
                      onProductClick?.(product.id)
                    }
                  >
                    {image(product) ? (
                      <img
                        src={image(product)}
                        alt={name(product)}
                      />
                    ) : (
                      <span>{name(product)}</span>
                    )}
                  </button>

                  <div className="catalog-card-copy">
                    <p>
                      {ar
                        ? product.brand_name_ar
                        : product.brand_name_en}
                    </p>

                    <h2>{name(product)}</h2>

                    <div className="catalog-card-bottom">
                      <div className="catalog-price-row">
                        <strong className="catalog-price">
                          $
                          {Number(
                            product.price || 0
                          ).toLocaleString()}
                        </strong>

                        {Number(product.old_price || 0) >
                          Number(product.price || 0) && (
                            <span className="catalog-old-price">
                              $
                              {Number(
                                product.old_price
                              ).toLocaleString()}
                            </span>
                          )}
                      </div>

                      <button
                        type="button"
                        className={
                          wishlisted ? "wishlisted" : ""
                        }
                        aria-label={
                          wishlisted
                            ? ar
                              ? "إزالة من المفضلة"
                              : "Remove from wishlist"
                            : t.wish
                        }
                        aria-pressed={wishlisted}
                        onClick={(event) =>
                          handleWishlistClick(
                            event,
                            product.id
                          )
                        }
                      >
                        <HeartIcon filled={wishlisted} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="catalog-add"
                      onClick={() =>
                        onProductClick?.(product.id)
                      }
                    >
                      {t.details}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="catalog-empty">
            <p>{t.empty}</p>

            <button
              type="button"
              onClick={() => setFilters(clean)}
            >
              {t.clear}
            </button>
          </div>
        )}
      </div>
    </section>
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

function Select({
  label,
  value,
  items,
  any,
  change,
}) {
  const [open, setOpen] = useState(false);

  const selected = items.find(
    ([itemValue]) => itemValue === value
  );

  return (
    <div className="catalog-custom-select">
      <button
        type="button"
        className="catalog-custom-select-trigger"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>
          {selected ? selected[1] : `${any} ${label}`}
        </span>

        <span
          className={`catalog-custom-select-arrow ${
            open ? "open" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className="catalog-custom-select-menu"
          role="listbox"
        >
          <button
            type="button"
            className={!value ? "active" : ""}
            onClick={() => {
              change("");
              setOpen(false);
            }}
          >
            {any} {label}
          </button>

          {items.map(([itemValue, name]) => (
            <button
              type="button"
              key={itemValue}
              className={
                itemValue === value ? "active" : ""
              }
              onClick={() => {
                change(itemValue);
                setOpen(false);
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorPicker({
  label,
  any,
  colors,
  isArabic,
  value,
  open,
  onToggle,
  onChange,
}) {
  const selected = colors.find(
    (color) => color.filterKey === value
  );

  return (
    <div className="color-picker">
      <button
        type="button"
        className="color-picker-trigger"
        onClick={onToggle}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected && (
          <i
            style={{
              backgroundColor: selected.hex_code,
            }}
          />
        )}

        <span>
          {selected
            ? isArabic
              ? selected.name_ar
              : selected.name_en
            : `${any} ${label}`}
        </span>

        <span className="color-picker-arrow" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="color-picker-menu"
          role="listbox"
        >
          <button
            type="button"
            className={!value ? "active" : ""}
            onClick={() => onChange("")}
          >
            <span>
              {any} {label}
            </span>
          </button>

          {colors.map((color) => (
            <button
              type="button"
              key={color.filterKey}
              className={
                color.filterKey === value
                  ? "active"
                  : ""
              }
              onClick={() =>
                onChange(color.filterKey)
              }
            >
              <i
                style={{
                  backgroundColor:
                    color.hex_code,
                }}
              />

              <span>
                {isArabic
                  ? color.name_ar
                  : color.name_en}
              </span>

              <small>{color.hex_code}</small>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
