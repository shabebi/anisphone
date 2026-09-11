import React, { useState } from "react";
import "./Header.css";

export default function Header({
  language = "en",
  onLanguageChange,
  onSearch,
  onWishlist,
  onCart,
  onAccount,
  onHome,
  onProducts,
  onDeals,
  onBranches,
}) {
  const isArabic = language === "ar";

  const [search, setSearch] = useState("");

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
        logoAr: "أنس فون",
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
        logoAr: "أنس فون",
        logoEn: "ANIS PHONE STORE",
      };

  const toggleLanguage = () => {
    onLanguageChange?.(isArabic ? "en" : "ar");
  };

  const submitSearch = (event) => {
    event.preventDefault();
    onSearch?.(search);
  };

  return (
    <header
      className={`anis-header ${isArabic ? "rtl" : "ltr"}`}
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
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 42 48" fill="none">
              <rect
                x="7"
                y="3"
                width="28"
                height="40"
                rx="5"
                stroke="currentColor"
                strokeWidth="2.2"
              />

              <path
                d="M14 14h14M14 20h14M14 26h7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />

              <path
                d="M25 31l3 3 6-7"
                stroke="currentColor"
                strokeWidth="2.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>

          <span className="brand-copy">
            <strong>{text.logoAr}</strong>
            <small>{text.logoEn}</small>
          </span>
        </a>


        {/* =========================
            SEARCH
        ========================= */}

        <form className="search-box" onSubmit={submitSearch}>
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
            onChange={(e) => setSearch(e.target.value)}
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

          <button
            className="icon-button"
            onClick={onAccount}
            aria-label={text.account}
            type="button"
          >
            <UserIcon />
          </button>

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
            className="active"
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