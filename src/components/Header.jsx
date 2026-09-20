import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Header.css";
import "./HeaderSearch.css";
import logo from "../assets/logo.png";

export default function Header({
  language = "en",
  className = "",
  onLanguageChange,
  onSearch,
  searchIndex = [],
  onWishlist,
  onCart,
  onAccount,
  onHome,
  onProducts,
  onDeals,
  onBranches,
  activePage = "home",
  user,
  onLogout,
}) {
  const isArabic = language === "ar";

  const [search, setSearch] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  const text = isArabic
    ? {
      search: "ابحث عن هاتف، ماركة، أو مواصفات...",
      home: "الرئيسية",
      products: "كافة المنتجات",
      deals: "العروض والخصومات",
      branches: "الفروع",
      language: "EN",
      account: "الحساب",
      wishlist: "المفضلة",
      cart: "السلة",
      logoAr: "أنيس فون",
      logoEn: "ANIS PHONE STORE",
    }
    : {
      search: "Search for phones, brands, or specifications...",
      home: "Home",
      products: "All Products",
      deals: "Deals & Discounts",
      branches: "Branches",
      language: "AR",
      account: "Account",
      wishlist: "Wishlist",
      cart: "Cart",
      logoAr: "أنيس فون",
      logoEn: "ANIS PHONE STORE",
    };

  const toggleLanguage = () => {
    onLanguageChange?.(isArabic ? "en" : "ar");
  };

  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLocaleLowerCase()
      .replace(/[ً-ٟ]/g, "")
      .replace(/\s+/g, " ");

  const getSearchText = (product) => {
    const specifications = Array.isArray(product?.specifications)
      ? product.specifications
        .flatMap((spec) => [
          spec?.name_ar,
          spec?.name_en,
          spec?.value_ar,
          spec?.value_en,
          spec?.section_ar,
          spec?.section_en,
        ])
        .filter(Boolean)
      : [];

    const colors = Array.isArray(product?.colors)
      ? product.colors.flatMap((color) => [
        color?.name_ar,
        color?.name_en,
      ])
      : [];

    const variants = Array.isArray(product?.variants)
      ? product.variants.flatMap((variant) => [
        variant?.name_ar,
        variant?.name_en,
      ])
      : [];

    return normalize([
      product?.name_ar,
      product?.name_en,
      product?.slug,
      product?.description_ar,
      product?.description_en,
      product?.brand_name_ar,
      product?.brand_name_en,
      product?.category_name_ar,
      product?.category_name_en,
      product?.condition,
      ...specifications,
      ...colors,
      ...variants,
    ].join(" "));
  };

  const searchSuggestions = useMemo(() => {
    const q = normalize(search);
    if (!q) return [];

    // ============================================================
    // 1. EXISTING PAGES — HIGHEST PRIORITY
    // Partial page names are supported, e.g. "de" -> Deals.
    // ============================================================
    const pages = [
      {
        page: "home",
        en: "Home",
        ar: "الرئيسية",
        terms: ["home", "الرئيسية", "الرئيسيه"],
      },
      {
        page: "products",
        en: "All Products",
        ar: "كافة المنتجات",
        terms: ["products", "all products", "product", "كافة المنتجات", "المنتجات", "منتجات"],
      },
      {
        page: "deals",
        en: "Deals & Discounts",
        ar: "العروض والخصومات",
        terms: ["deals", "deal", "discounts", "discount", "العروض", "الخصومات", "عرض", "خصومات"],
      },
      {
        page: "branches",
        en: "Branches",
        ar: "الفروع",
        terms: ["branches", "branch", "الفروع", "فرع"],
      },
      {
        page: "faq",
        en: "FAQ",
        ar: "الأسئلة الشائعة",
        terms: ["faq", "questions", "frequently asked", "الأسئلة", "الاسئلة", "الأسئلة الشائعة"],
      },
      {
        page: "rateus",
        en: "Rate Us",
        ar: "قيّمنا",
        terms: ["rate us", "rateus", "rating", "review", "reviews", "قيّمنا", "قيمنا", "تقييم", "التقييم"],
      },
      {
        page: "contact",
        en: "Contact",
        ar: "تواصل معنا",
        terms: ["contact", "contact us", "تواصل", "تواصل معنا", "اتصل", "اتصل بنا"],
      },
      {
        page: "auth",
        en: "Account",
        ar: "الحساب",
        terms: ["account", "login", "sign in", "الحساب", "تسجيل الدخول"],
      },
    ];

    // Exact page match first.
    const exactPage = pages.find((page) =>
      page.terms.some((term) => normalize(term) === q)
    );

    if (exactPage) {
      return [
        {
          type: "page",
          page: exactPage.page,
          title: isArabic ? exactPage.ar : exactPage.en,
        },
      ];
    }

    // Then page-prefix match. This prevents generic product/spec
    // substring matches such as "de" from appearing for Deals.
    const partialPage = pages.find((page) =>
      page.terms.some((term) => {
        const normalizedTerm = normalize(term);
        return normalizedTerm.startsWith(q) && q.length >= 2;
      })
    );

    if (partialPage) {
      return [
        {
          type: "page",
          page: partialPage.page,
          title: isArabic ? partialPage.ar : partialPage.en,
        },
      ];
    }

    // ============================================================
    // 2. BRANDS
    // If a brand matches, show ONLY the brand name.
    // ============================================================
    const brandMap = new Map();

    searchIndex.forEach((product) => {
      if (!product?.brand_slug) return;

      const en = normalize(product.brand_name_en);
      const ar = normalize(product.brand_name_ar);
      const slug = normalize(product.brand_slug);

      const matches =
        en === q ||
        ar === q ||
        slug === q ||
        (q.length >= 2 && (en.startsWith(q) || ar.startsWith(q) || slug.startsWith(q)));

      if (!matches) return;

      if (!brandMap.has(slug)) {
        brandMap.set(slug, {
          type: "brand",
          slug: product.brand_slug,
          title: isArabic
            ? product.brand_name_ar || product.brand_name_en
            : product.brand_name_en || product.brand_name_ar,
        });
      }
    });

    if (brandMap.size > 0) {
      return [...brandMap.values()].slice(0, 6);
    }

    // ============================================================
    // 3. PRODUCT NAME MATCHES
    // Search product NAMES, not arbitrary description substrings.
    // ============================================================
    const productMatches = searchIndex
      .map((product) => {
        const names = [
          product?.name_en,
          product?.name_ar,
          product?.slug,
        ]
          .filter(Boolean)
          .map(normalize);

        const exactName = names.some((name) => name === q);

        // Token-based matching prevents "de" from matching words like
        // "device" or "generation" inside unrelated product data.
        const matchesName = names.some((name) => {
          const nameTokens = name.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
          const queryTokens = q.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

          if (!queryTokens.length) return false;

          return queryTokens.every((queryToken) =>
            nameTokens.some(
              (nameToken) =>
                nameToken === queryToken ||
                (queryToken.length >= 3 && nameToken.startsWith(queryToken))
            )
          );
        });

        if (!matchesName) return null;

        return {
          type: "product",
          product,
          score: exactName ? 100 : 50,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    if (productMatches.length > 0) {
      return productMatches;
    }

    // ============================================================
    // 4. SPECIFICATION MATCHES
    // Specs can find products, but the dropdown still shows ONLY
    // the matching product name.
    // ============================================================
    const specificationMatches = searchIndex
      .map((product) => {
        const specifications = Array.isArray(product?.specifications)
          ? product.specifications.flatMap((spec) => [
            spec?.name_ar,
            spec?.name_en,
            spec?.value_ar,
            spec?.value_en,
            spec?.section_ar,
            spec?.section_en,
          ])
          : [];

        const specValues = specifications.filter(Boolean).map(normalize);
        const queryTokens = q.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

        const matches = specValues.some((value) => {
          const valueTokens = value.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

          if (queryTokens.length === 1) {
            const token = queryTokens[0];
            return valueTokens.some(
              (valueToken) =>
                valueToken === token ||
                (token.length >= 3 && valueToken.startsWith(token))
            );
          }

          return queryTokens.every((queryToken) =>
            valueTokens.some(
              (valueToken) =>
                valueToken === queryToken ||
                (queryToken.length >= 3 && valueToken.startsWith(queryToken))
            )
          );
        });

        if (!matches) return null;

        return {
          type: "product",
          product,
          score: 1,
        };
      })
      .filter(Boolean)
      .slice(0, 8);

    return specificationMatches;
  }, [search, searchIndex, isArabic]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!searchRef.current?.contains(event.target)) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();

    const cleanSearch = search.trim();

    if (!cleanSearch) return;

    setSearchOpen(false);

    // If the typed text matches something in the dropdown,
    // use the exact same suggestion as clicking it.
    const matchingSuggestion = searchSuggestions.find((suggestion) => {
      if (suggestion?.type === "page") {
        return normalize(suggestion.title) === normalize(cleanSearch);
      }

      if (suggestion?.type === "brand") {
        return normalize(suggestion.title) === normalize(cleanSearch);
      }

      if (suggestion?.type === "product") {
        const product = suggestion.product;

        return [
          product?.name_en,
          product?.name_ar,
          product?.slug,
        ]
          .filter(Boolean)
          .some(
            (value) =>
              normalize(value) === normalize(cleanSearch)
          );
      }

      return false;
    });

    // Exact match → behave exactly like clicking the dropdown.
    if (matchingSuggestion) {
      onSearch?.(matchingSuggestion);
      return;
    }

    // For specification searches such as OLED, 256GB, 12GB RAM, etc.,
    // use the first dropdown result.
    if (searchSuggestions.length > 0) {
      onSearch?.(searchSuggestions[0]);
      return;
    }

    // Nothing matched.
    onSearch?.(cleanSearch);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchOpen(false);

    if (suggestion?.type === "page") {
      setSearch(suggestion.title);
      onSearch?.(suggestion);
      return;
    }

    if (suggestion?.type === "brand") {
      setSearch(suggestion.title);
      onSearch?.(suggestion);
      return;
    }

    const product = suggestion?.product;
    setSearch(
      isArabic
        ? product?.name_ar || product?.name_en || ""
        : product?.name_en || product?.name_ar || ""
    );
    onSearch?.({ type: "product", product });
  };

  return (
    <header
      className={`anis-header ${isArabic ? "rtl" : "ltr"} ${className}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="header-main">

        {/* =========================
            LOGO
        ========================= */}

        <a
          className="brand"
          href="#"
          aria-label="Anis Phone Store"
          onClick={(e) => {
            e.preventDefault();
            onHome?.();
          }}
        >
          <span className="brand-mark">
            <img src={logo} alt="" />
          </span>

          <span className="brand-copy">
            <strong>{text.logoAr}</strong>
            <small>{text.logoEn}</small>
          </span>
        </a>


        {/* =========================
            SEARCH
        ========================= */}

        <div className="search-wrap" ref={searchRef}>          <form className="search-box" onSubmit={submitSearch}>
          <button
            type="button"
            className="filter-button"
            aria-label="Search filters"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M5 7h14M8 12h8M10 17h4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <circle cx="9" cy="7" r="1.6" fill="currentColor" />
              <circle cx="15" cy="12" r="1.6" fill="currentColor" />
              <circle cx="13" cy="17" r="1.6" fill="currentColor" />
            </svg>
          </button>

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => {
              if (search.trim()) setSearchOpen(true);
            }}
            placeholder={text.search}
            aria-label={text.search}
          />

          <button
            type="submit"
            className="search-submit"
            aria-label={isArabic ? "بحث" : "Search"}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="10.8"
                cy="10.8"
                r="6.2"
                stroke="currentColor"
                strokeWidth="1.8"
              />

              <path
                d="M15.5 15.5L20 20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </form>

          {searchOpen && search.trim() && (
            <div
              className={`search-results-dropdown ${isArabic ? "rtl" : "ltr"
                }`}
              role="listbox"
              style={{
                position: "absolute",
                zIndex: 99999,
                pointerEvents: "auto",
              }}
            >
              {searchSuggestions.length > 0 ? (
                <>
                  {searchSuggestions.map((suggestion, index) => {
                    const isProduct = suggestion.type === "product";
                    const product = suggestion.product;

                    const name = isProduct
                      ? isArabic
                        ? product?.name_ar || product?.name_en
                        : product?.name_en || product?.name_ar
                      : suggestion.title;

                    const image = isProduct
                      ? product?.images?.find((item) => item?.is_primary)
                        ?.image_url ||
                      product?.images?.[0]?.image_url
                      : null;

                    return (
                      <button
                        type="button"
                        className="search-result-item"
                        key={
                          isProduct
                            ? product?.id
                            : `${suggestion.type}-${suggestion.page || suggestion.slug}-${index}`
                        }
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleSuggestionClick(suggestion);
                        }}
                      >
                        <span className="search-result-image">
                          {image ? (
                            <img src={image} alt="" />
                          ) : (
                            <span>{suggestion.type === "brand" ? "🏷️" : "↗"}</span>
                          )}
                        </span>

                        <span className="search-result-copy">
                          <strong>{name}</strong>
                        </span>

                        <span className="search-result-arrow">›</span>
                      </button>
                    );
                  })}
                </>
              ) : (
                <div className="search-no-results">
                  {isArabic
                    ? "لا توجد نتائج مطابقة."
                    : "No matching results."}
                </div>
              )}
            </div>
          )}
        </div>


        {/* =========================
            HEADER ACTIONS
        ========================= */}

        <div className="header-actions">

          {/* LANGUAGE */}

          <button
            className="icon-button language-button"
            onClick={toggleLanguage}
            aria-label={
              isArabic ? "Switch to English" : "التبديل إلى العربية"
            }
            type="button"
          >
            {text.language}
          </button>


          {/* WISHLIST */}

          <button
            className="icon-button"
            onClick={onWishlist}
            aria-label={text.wishlist}
            type="button"
          >
            <HeartIcon />
          </button>


          {/* CART */}

          <button
            className="icon-button"
            onClick={onCart}
            aria-label={text.cart}
            type="button"
          >
            <CartIcon />
          </button>


          {/* ACCOUNT */}

          <div className="account-menu">
            <button className="icon-button" onClick={() => user ? setAccountOpen((open) => !open) : onAccount?.()} aria-label={text.account} type="button"><UserIcon /></button>
            {user && accountOpen && <div className="account-popover"><strong>{user.name}</strong><span>{user.phone}</span><button type="button" onClick={onLogout}>Sign out</button></div>}
          </div>

        </div>
      </div>


      {/* =========================
          NAVIGATION
      ========================= */}

      <nav
        className="header-nav"
        aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}
      >
        <div className="nav-links">

          {/* HOME */}

          <a
            href="#home"
            className={activePage === "home" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              onHome?.();
            }}
          >
            <HomeIcon />
            <span>{text.home}</span>
          </a>


          {/* PRODUCTS */}

          <a
            href="#products"
            className={activePage === "products" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              onProducts?.();
            }}
          >
            <GridIcon />
            <span>{text.products}</span>
          </a>


          {/* DEALS */}

          <a
            href="#deals"
            className={activePage === "deals" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              onDeals?.();
            }}
          >
            <TagIcon />
            <span>{text.deals}</span>
          </a>


          {/* BRANCHES */}

          <a
            href="#branches"
            className={activePage === "branches" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              onBranches?.();
            }}
          >
            <StoreIcon />
            <span>{text.branches}</span>
          </a>

        </div>
      </nav>
    </header>
  );
}


/* ========================================
   ICON WRAPPER
======================================== */

function Icon({ children, className = "" }) {
  return (
    <svg
      className={`nav-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}


/* ========================================
   HOME ICON
======================================== */

function HomeIcon() {
  return (
    <Icon>
      <path
        d="M4 10.5 12 4l8 6.5v8.5a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-8.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M9.5 20.5v-5h5v5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </Icon>
  );
}


/* ========================================
   PRODUCTS ICON
======================================== */

function GridIcon() {
  return (
    <Icon>
      <rect
        x="4"
        y="4"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <rect
        x="15"
        y="4"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <rect
        x="4"
        y="15"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      <rect
        x="15"
        y="15"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </Icon>
  );
}


/* ========================================
   DEALS ICON
======================================== */

function TagIcon() {
  return (
    <Icon>
      <path
        d="M4.5 6.5v5.2a2 2 0 0 0 .59 1.42l5.8 5.8a2 2 0 0 0 2.83 0l4.4-4.4a2 2 0 0 0 0-2.83l-5.8-5.8a2 2 0 0 0-1.42-.59H6.5a2 2 0 0 0-2 2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <circle
        cx="8"
        cy="9"
        r="1.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </Icon>
  );
}


/* ========================================
   BRANCHES ICON
======================================== */

function StoreIcon() {
  return (
    <Icon>
      <path
        d="M4 9.5 6 5h12l2 4.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M4 9.5c0 1.5 1.15 2.5 2.5 2.5S9 11 9 9.5c0 1.5 1.15 2.5 2.5 2.5S14 11 14 9.5c0 1.5 1.15 2.5 2.5 2.5S19 11 19 9.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M5 12v7h14v-7M9 19v-4h6v4"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </Icon>
  );
}


/* ========================================
   WISHLIST ICON
======================================== */

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5h2l1.6 9.2a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 1.9-1.4L21 8H7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="10" cy="19" r="1.3" fill="currentColor" />
      <circle cx="18" cy="19" r="1.3" fill="currentColor" />
    </svg>
  );
}


/* ========================================
   ACCOUNT ICON
======================================== */

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle
        cx="12"
        cy="8"
        r="3"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M5.5 20c.7-3.3 3-5 6.5-5s5.8 1.7 6.5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
