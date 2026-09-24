import { useEffect, useMemo, useState } from "react";
import "./ProductDetailsPage.css";

const API =
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/v1"
    : "https://anisphone.onrender.com/api/v1";

export default function ProductDetailsPage({
  productSlug,
  language = "en",
  onBack,
  onProductClick,
  onAddToCart,
  onWishlist,
}) {
  const ar = language === "ar";

  const t = ar
    ? {
      store: "أنيس فون ستور",
      back: "العودة للمنتجات",
      loading: "جاري تحميل المنتج...",
      error: "تعذر تحميل تفاصيل المنتج.",
      retry: "حاول مرة أخرى",
      notFound: "المنتج غير موجود أو لم يعد متاحاً.",
      brand: "العلامة التجارية",
      category: "التصنيف",
      condition: "الحالة",
      newCondition: "جديد",
      usedCondition: "مستعمل",
      refurbishedCondition: "مجدد",
      price: "السعر",
      available: "متوفر",
      unavailable: "غير متوفر",
      onlyLeft: "متبقي فقط",
      description: "وصف المنتج",
      specifications: "المواصفات",
      colors: "الألوان",
      variants: "الخيارات",
      add: "أضف إلى السلة",
      wishlist: "إضافة للمفضلة",
      removeWishlist: "إزالة من المفضلة",
      related: "منتجات قد تعجبك",
      noImages: "لا توجد صور لهذا المنتج",
      discount: "خصم",
      selectOption: "اختر خياراً",
    }
    : {
      store: "ANIS PHONE STORE",
      back: "Back to products",
      loading: "Loading product...",
      error: "Unable to load product details.",
      retry: "Try Again",
      notFound:
        "This product could not be found or is no longer available.",
      brand: "Brand",
      category: "Category",
      condition: "Condition",
      newCondition: "New",
      usedCondition: "Used",
      refurbishedCondition: "Refurbished",
      price: "Price",
      available: "In stock",
      unavailable: "Out of stock",
      onlyLeft: "Only",
      description: "Product description",
      specifications: "Specifications",
      colors: "Colors",
      variants: "Options",
      add: "Add to Cart",
      wishlist: "Add to wishlist",
      removeWishlist: "Remove from wishlist",
      related: "You may also like",
      noImages: "No images available",
      discount: "OFF",
      selectOption: "Select an option",
    };

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");

  // ============================================
  // WISHLIST
  // ============================================

  const [isWishlisted, setIsWishlisted] =
    useState(false);

  /* ============================================================
     LOAD PRODUCT
  ============================================================ */

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");
        setProduct(null);

        setActiveImage(0);
        setSelectedColor("");
        setSelectedVariant("");

        if (!productSlug) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        const response = await fetch(
          `${API}/products/${encodeURIComponent(
            productSlug
          )}`,
          {
            signal: controller.signal,
          }
        );

        if (response.status === 404) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (!response.ok) {
          throw new Error("REQUEST_FAILED");
        }

        const result = await response.json();

        if (!result?.data) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        setProduct(result.data);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error(
          "Product details error:",
          err
        );

        setError(
          err.message === "PRODUCT_NOT_FOUND"
            ? "not-found"
            : "error"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => controller.abort();
  }, [productSlug]);

  /* ============================================================
     LOAD WISHLIST STATUS
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    async function loadWishlistStatus() {
      if (!product?.id) return;

      try {
        const token = localStorage.getItem("anis_token");

        if (!token) {
          if (!cancelled) {
            setIsWishlisted(false);
          }
          return;
        }

        const response = await fetch(
          `${API}/favorites`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (!cancelled) {
            setIsWishlisted(false);
          }
          return;
        }

        const result = await response.json();

        const favorites = Array.isArray(
          result?.data
        )
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        const found = favorites.some(
          (item) => {
            const favoriteProductId =
              item?.product_id ??
              item?.productId ??
              item?.product?.id ??
              item?.product?.product_id;

            return (
              String(favoriteProductId) ===
              String(product.id)
            );
          }
        );

        if (!cancelled) {
          setIsWishlisted(found);
        }
      } catch (err) {
        console.error(
          "Wishlist status error:",
          err
        );

        if (!cancelled) {
          setIsWishlisted(false);
        }
      }
    }

    loadWishlistStatus();

    return () => {
      cancelled = true;
    };
  }, [product?.id]);

  /* ============================================================
     ALL PRODUCT IMAGES
  ============================================================ */

  const images = useMemo(() => {
    if (!Array.isArray(product?.images)) {
      return [];
    }

    return [...product.images].sort((a, b) => {
      if (
        Boolean(a.is_primary) !==
        Boolean(b.is_primary)
      ) {
        return a.is_primary ? -1 : 1;
      }

      return (
        Number(a.sort_order || 0) -
        Number(b.sort_order || 0)
      );
    });
  }, [product]);

  /* ============================================================
     ALL COLORS
  ============================================================ */

  const allColors = useMemo(() => {
    if (!product || !Array.isArray(product.colors)) {
      return [];
    }

    return product.colors.filter(
      (color) => color?.id
    );
  }, [product]);

  /* ============================================================
     ACTIVE VARIANTS
  ============================================================ */

  const visibleVariants = useMemo(
    () =>
      (product?.variants || []).filter(
        (variant) =>
          variant.is_active !== false
      ),
    [product]
  );

  const selectedVariantData = useMemo(
    () =>
      visibleVariants.find(
        (variant) =>
          String(variant.id) ===
          String(selectedVariant)
      ),
    [visibleVariants, selectedVariant]
  );

  /* ============================================================
     COLOR → IMAGE RELATIONSHIP
  ============================================================ */

  const colorImages = useMemo(() => {
    if (!selectedColor) {
      return images;
    }

    return images.filter((image) => {
      const imageColorId =
        image.color_id ?? image.colorId;

      return (
        imageColorId &&
        String(imageColorId) ===
        String(selectedColor)
      );
    });
  }, [images, selectedColor]);

  /* ============================================================
     RESET IMAGE WHEN COLOR CHANGES
  ============================================================ */

  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor]);

  useEffect(() => {
    if (
      colorImages.length === 0 ||
      activeImage >= colorImages.length
    ) {
      setActiveImage(0);
    }
  }, [colorImages, activeImage]);

  /* ============================================================
     PRICE
  ============================================================ */

  const currentPrice = Number(
    selectedVariantData?.price ??
    product?.price ??
    0
  );

  const oldPrice = Number(
    product?.old_price ?? 0
  );

  const hasOldPrice =
    oldPrice > currentPrice;

  const discount = hasOldPrice
    ? Math.round(
      ((oldPrice - currentPrice) /
        oldPrice) *
      100
    )
    : 0;

  /* ============================================================
     CURRENT IMAGE
  ============================================================ */

  const currentImage =
    colorImages[activeImage]?.image_url || "";

  /* ============================================================
     HELPERS
  ============================================================ */

  function productName() {
    return ar
      ? product?.name_ar
      : product?.name_en;
  }

  function formatPrice(value) {
    return `$${Number(
      value || 0
    ).toLocaleString()}`;
  }

  function conditionLabel(value) {
    if (value === "used") {
      return t.usedCondition;
    }

    if (value === "refurbished") {
      return t.refurbishedCondition;
    }

    return t.newCondition;
  }

  /* ============================================================
     COLOR SELECTION
  ============================================================ */

  function chooseColor(color) {
    setSelectedColor(color.id);
    setActiveImage(0);
  }

  /* ============================================================
     VARIANT SELECTION
  ============================================================ */

  function chooseVariant(variant) {
    setSelectedVariant(variant.id);

    const variantColorIds = new Set(
      (variant.colors || []).map(
        (color) => String(color.id)
      )
    );

    const matchingColor =
      allColors.find((color) =>
        variantColorIds.has(
          String(color.id)
        )
      );

    if (matchingColor) {
      setSelectedColor(
        matchingColor.id
      );
    }

    setActiveImage(0);
  }

  /* ============================================================
     ADD TO CART
  ============================================================ */

  function handleAddToCart() {
    onAddToCart?.(product.id, {
      variantId:
        selectedVariant || null,

      colorId:
        selectedColor || null,

      product,
    });
  }

  /* ============================================================
     WISHLIST
  ============================================================ */

  function handleWishlist() {
    const next = !isWishlisted;

    // Update heart immediately.
    setIsWishlisted(next);

    // Parent handles actual API add/remove.
    onWishlist?.(product.id);
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <section
        className={`product-details-page ${ar ? "rtl" : "ltr"
          }`}
        dir={ar ? "rtl" : "ltr"}
      >
        <div className="product-details-inner">
          <div className="product-details-loading">
            <div className="details-skeleton gallery-skeleton" />

            <div className="details-skeleton copy-skeleton" />
          </div>
        </div>
      </section>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !product) {
    return (
      <section
        className={`product-details-page ${ar ? "rtl" : "ltr"
          }`}
        dir={ar ? "rtl" : "ltr"}
      >
        <div className="product-details-inner">

          <button
            className="details-back"
            type="button"
            onClick={onBack}
          >
            <BackIcon />

            <span>
              {t.back}
            </span>
          </button>

          <div className="details-state">

            <span className="details-state-icon">
              !
            </span>

            <h2>
              {error === "not-found"
                ? t.notFound
                : t.error}
            </h2>

            {error !== "not-found" && (
              <button
                type="button"
                className="details-primary"
                onClick={() =>
                  window.location.reload()
                }
              >
                {t.retry}
              </button>
            )}

          </div>
        </div>
      </section>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <section
      className={`product-details-page ${ar ? "rtl" : "ltr"
        }`}
      dir={ar ? "rtl" : "ltr"}
    >
      <div className="product-details-inner">

        {/* ======================================================
            BACK
        ======================================================= */}

        <button
          className="details-back"
          type="button"
          onClick={onBack}
        >
          <BackIcon />

          <span>
            {t.back}
          </span>
        </button>

        {/* ======================================================
            BREADCRUMB
        ======================================================= */}

        <div className="details-breadcrumb">

          <span>
            {t.store}
          </span>

          <b>/</b>

          <span>
            {ar
              ? product.category_name_ar
              : product.category_name_en}
          </span>

          <b>/</b>

          <strong>
            {productName()}
          </strong>

        </div>

        {/* ======================================================
            MAIN PRODUCT AREA
        ======================================================= */}

        <div className="product-details-main">

          {/* ====================================================
              IMAGE GALLERY
          ===================================================== */}

          <div className="details-gallery">

            <div className="details-main-image">

              {currentImage ? (
                <img
                  src={currentImage}
                  alt={productName()}
                />
              ) : (
                <div className="details-no-image">
                  {t.noImages}
                </div>
              )}

              {discount > 0 && (
                <span className="details-discount">
                  {discount}% {t.discount}
                </span>
              )}

            </div>

            {colorImages.length > 1 && (
              <div
                className="details-thumbnails"
                aria-label={
                  ar
                    ? "صور المنتج"
                    : "Product images"
                }
              >

                {colorImages.map(
                  (image, index) => (
                    <button
                      type="button"
                      key={
                        image.id ||
                        `${image.image_url}-${index}`
                      }
                      className={
                        index === activeImage
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setActiveImage(index)
                      }
                      aria-label={`${ar
                        ? "الصورة"
                        : "Image"} ${index + 1}`}
                    >
                      <img
                        src={image.image_url}
                        alt=""
                      />
                    </button>
                  )
                )}

              </div>
            )}

          </div>

          {/* ====================================================
              PRODUCT INFORMATION
          ===================================================== */}

          <div className="details-copy">

            {/* BRAND */}

            <div className="details-brand-line">

              {product.brand_logo && (
                <img
                  src={product.brand_logo}
                  alt=""
                />
              )}

              <span>
                {ar
                  ? product.brand_name_ar
                  : product.brand_name_en}
              </span>

            </div>

            {/* PRODUCT NAME */}

            <h1>
              {productName()}
            </h1>

            {/* META */}

            <div className="details-meta">

              {product.category_name_en && (
                <span>
                  {t.category}:{" "}
                  {ar
                    ? product.category_name_ar
                    : product.category_name_en}
                </span>
              )}

              <span>
                {t.condition}:{" "}
                {conditionLabel(
                  product.condition
                )}
              </span>

            </div>

            {/* PRICE */}

            <div className="details-price">

              <strong>
                {formatPrice(
                  currentPrice
                )}
              </strong>

              {hasOldPrice && (
                <del>
                  {formatPrice(
                    oldPrice
                  )}
                </del>
              )}

              {discount > 0 && (
                <span>
                  {discount}%{" "}
                  {t.discount}
                </span>
              )}

            </div>

            {/* STOCK */}

            <div
              className={`details-stock ${product.inventory_available
                  ? "in-stock"
                  : "out-stock"
                }`}
            >
              <span />

              {product.inventory_available
                ? Number(
                  product.inventory_quantity
                ) <= 2
                  ? `${t.onlyLeft} ${product.inventory_quantity
                  }`
                  : t.available
                : t.unavailable}
            </div>

            {/* ==================================================
                COLORS
            =================================================== */}

            {allColors.length > 0 && (
              <div className="details-option-group">

                <div className="details-option-heading">

                  <strong>
                    {t.colors}
                  </strong>

                  {selectedColor && (
                    <span>
                      {(() => {
                        const selected =
                          allColors.find(
                            (color) =>
                              String(
                                color.id
                              ) ===
                              String(
                                selectedColor
                              )
                          );

                        if (!selected) {
                          return "";
                        }

                        return ar
                          ? selected.name_ar
                          : selected.name_en;
                      })()}
                    </span>
                  )}

                </div>

                <div className="details-colors">

                  {allColors.map(
                    (color) => (
                      <button
                        type="button"
                        key={color.id}
                        className={
                          String(
                            selectedColor
                          ) ===
                            String(color.id)
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          chooseColor(
                            color
                          )
                        }
                        title={
                          ar
                            ? color.name_ar
                            : color.name_en
                        }
                      >
                        <i
                          style={{
                            backgroundColor:
                              color.hex_code,
                          }}
                        />

                        <span>
                          {ar
                            ? color.name_ar
                            : color.name_en}
                        </span>
                      </button>
                    )
                  )}

                </div>
              </div>
            )}

            {/* ==================================================
                VARIANTS
            =================================================== */}

            {visibleVariants.length > 0 && (
              <div className="details-option-group">

                <div className="details-option-heading">

                  <strong>
                    {t.variants}
                  </strong>

                  <span>
                    {selectedVariantData
                      ? ar
                        ? selectedVariantData.name_ar
                        : selectedVariantData.name_en
                      : t.selectOption}
                  </span>

                </div>

                <div className="details-variants">

                  {visibleVariants.map(
                    (variant) => (
                      <button
                        type="button"
                        key={variant.id}
                        className={
                          String(
                            selectedVariant
                          ) ===
                            String(
                              variant.id
                            )
                            ? "selected"
                            : ""
                        }
                        onClick={() =>
                          chooseVariant(
                            variant
                          )
                        }
                      >
                        <span>
                          {ar
                            ? variant.name_ar
                            : variant.name_en}
                        </span>

                        {variant.price !=
                          null && (
                            <small>
                              {formatPrice(
                                variant.price
                              )}
                            </small>
                          )}

                      </button>
                    )
                  )}

                </div>
              </div>
            )}

            {/* ==================================================
                ACTIONS
            =================================================== */}

            <div className="details-actions">

              <button
                type="button"
                className="details-primary"
                onClick={
                  handleAddToCart
                }
                disabled={
                  !product.inventory_available
                }
              >
                <CartIcon />

                {t.add}
              </button>

              <button
                type="button"
                className={`details-wishlist ${isWishlisted
                    ? "active"
                    : ""
                  }`}
                onClick={
                  handleWishlist
                }
                aria-label={
                  isWishlisted
                    ? t.removeWishlist
                    : t.wishlist
                }
                aria-pressed={
                  isWishlisted
                }
                title={
                  isWishlisted
                    ? t.removeWishlist
                    : t.wishlist
                }
              >
                <HeartIcon
                  filled={isWishlisted}
                />
              </button>

            </div>

          </div>
        </div>

        {/* ======================================================
            LOWER INFORMATION
        ======================================================= */}

        <div className="details-lower">

          {/* DESCRIPTION */}

          <section className="details-panel">

            <div className="details-panel-heading">

              <span>
                {t.store}
              </span>

              <h2>
                {t.description}
              </h2>

            </div>

            <p className="details-description">
              {(ar
                ? product.description_ar
                : product.description_en) ||
                (ar
                  ? "لا يوجد وصف لهذا المنتج."
                  : "No description is available for this product.")}
            </p>

          </section>

          {/* SPECIFICATIONS */}

          <section className="details-panel">

            <div className="details-panel-heading">

              <span>
                {t.store}
              </span>

              <h2>
                {t.specifications}
              </h2>

            </div>

            {product.specifications?.length ? (
              <div className="details-spec-groups">

                {groupSpecifications(
                  product.specifications,
                  ar
                ).map(
                  (group) => (
                    <div
                      className="details-spec-group"
                      key={group.title}
                    >

                      <h3>
                        {group.title}
                      </h3>

                      <div className="details-spec-list">

                        {group.items.map(
                          (item) => (
                            <div
                              className="details-spec-row"
                              key={item.id}
                            >

                              <span>
                                {item.name}
                              </span>

                              <strong>
                                {item.value}
                              </strong>

                            </div>
                          )
                        )}

                      </div>
                    </div>
                  )
                )}

              </div>
            ) : (
              <p className="details-muted">
                {ar
                  ? "لا توجد مواصفات إضافية."
                  : "No additional specifications are available."}
              </p>
            )}

          </section>

        </div>

        {/* ======================================================
            RELATED PRODUCTS
        ======================================================= */}

        {product.related_products?.length >
          0 && (
            <section className="details-related">

              <div className="details-related-heading">

                <span>
                  {t.store}
                </span>

                <h2>
                  {t.related}
                </h2>

              </div>

              <div className="details-related-grid">

                {product.related_products.map(
                  (related) => (
                    <button
                      type="button"
                      className="related-card"
                      key={related.id}
                      onClick={() =>
                        onProductClick?.(
                          related.id
                        )
                      }
                    >

                      <div className="related-image">

                        {related.image_url ? (
                          <img
                            src={
                              related.image_url
                            }
                            alt={
                              ar
                                ? related.name_ar
                                : related.name_en
                            }
                          />
                        ) : (
                          <span>
                            {ar
                              ? related.name_ar
                              : related.name_en}
                          </span>
                        )}

                      </div>

                      <div className="related-copy">

                        <span>
                          {ar
                            ? product.brand_name_ar
                            : product.brand_name_en}
                        </span>

                        <h3>
                          {ar
                            ? related.name_ar
                            : related.name_en}
                        </h3>

                        <strong>
                          {formatPrice(
                            related.price
                          )}
                        </strong>

                        {Number(
                          related.old_price
                        ) >
                          Number(
                            related.price
                          ) && (
                            <del>
                              {formatPrice(
                                related.old_price
                              )}
                            </del>
                          )}

                      </div>

                    </button>
                  )
                )}

              </div>

            </section>
          )}

      </div>
    </section>
  );
}

/* ================================================================
   SPECIFICATIONS
================================================================ */

function groupSpecifications(
  specifications,
  ar
) {
  const groups = new Map();

  specifications.forEach((spec) => {
    const title =
      (ar
        ? spec.section_ar
        : spec.section_en) ||
      (ar
        ? "المواصفات"
        : "Specifications");

    if (!groups.has(title)) {
      groups.set(title, []);
    }

    groups.get(title).push({
      id: spec.id,

      name:
        (ar
          ? spec.name_ar
          : spec.name_en) || "",

      value:
        (ar
          ? spec.value_ar
          : spec.value_en) || "",
    });
  });

  return [...groups.entries()].map(
    ([title, items]) => ({
      title,
      items,
    })
  );
}

/* ================================================================
   BACK ICON
================================================================ */

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 12H5M11 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ================================================================
   CART ICON
================================================================ */

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

/* ================================================================
   HEART ICON
================================================================ */

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