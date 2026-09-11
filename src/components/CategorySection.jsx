import React from "react";
import "./CategorySection.css";

/**
 * Anis Phone Store - Core Categories
 *
 * English:
 * <CategorySection language="en" />
 *
 * Arabic:
 * <CategorySection language="ar" />
 *
 * For the final bilingual website, pass the same language state used
 * by the header so the whole page changes together.
 */
export default function CategorySection({
  language = "en",
  onCategoryClick,
}) {
  const isArabic = language === "ar";

  const content = {
    en: {
      eyebrow: "CORE CATEGORIES",
      title: "Browse by Device Category",
      categories: [
        { id: "smartphones", label: "Smartphones", icon: "phone" },
        { id: "laptops", label: "Laptops & PC", icon: "laptop" },
        { id: "tablets", label: "Tablets", icon: "tablet" },
        { id: "audio", label: "Audio & Headphones", icon: "headphones" },
        { id: "smartwatches", label: "Smartwatches", icon: "watch" },
        { id: "accessories", label: "Accessories & Chargers", icon: "charger" },
      ],
    },
    ar: {
      eyebrow: "التصنيفات الرئيسية",
      title: "تصفح حسب فئات الأجهزة",
      categories: [
        { id: "smartphones", label: "الهواتف الذكية", icon: "phone" },
        { id: "laptops", label: "لابتوبات وكمبيوتر", icon: "laptop" },
        { id: "tablets", label: "الأجهزة اللوحية", icon: "tablet" },
        { id: "audio", label: "الصوتيات والسماعات", icon: "headphones" },
        { id: "smartwatches", label: "الساعات الذكية", icon: "watch" },
        { id: "accessories", label: "إكسسوارات وشواحن", icon: "charger" },
      ],
    },
  };

  const current = isArabic ? content.ar : content.en;

  return (
    <section
      className={`category-section ${isArabic ? "rtl" : "ltr"}`}
      dir={isArabic ? "rtl" : "ltr"}
      aria-labelledby="category-section-title"
    >
      <div className="category-heading">
        <span className="category-eyebrow">{current.eyebrow}</span>
        <h2 id="category-section-title">{current.title}</h2>
      </div>

      <div className="category-grid">
        {current.categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="category-card"
            onClick={() => onCategoryClick?.(category.id)}
            aria-label={category.label}
          >
            <span className="category-icon">
              <CategoryIcon type={category.icon} />
            </span>

            <span className="category-name">{category.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}


/* ========================================
   ICONS
======================================== */

function CategoryIcon({ type }) {
  switch (type) {
    case "phone":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect
            x="9"
            y="4"
            width="14"
            height="24"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.9"
          />
          <path
            d="M13 7h6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="16" cy="24.5" r="1" fill="currentColor" />
        </svg>
      );

    case "laptop":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect
            x="7"
            y="6"
            width="18"
            height="14"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.9"
          />
          <path
            d="M4 23h24M10 23l1.5-3h9L22 23"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "tablet":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <rect
            x="7"
            y="4"
            width="18"
            height="24"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.9"
          />
          <path
            d="M9.5 8h13M9.5 21h13"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="16" cy="24.5" r="1" fill="currentColor" />
        </svg>
      );

    case "headphones":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M7 17a9 9 0 0 1 18 0"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M7 16v6a2 2 0 0 0 2 2h2v-8H9a2 2 0 0 0-2 2ZM25 16v6a2 2 0 0 1-2 2h-2v-8h2a2 2 0 0 1 2 2Z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "watch":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M12 5h8l1 5H11l1-5ZM12 27h8l1-5H11l1 5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <rect
            x="9"
            y="9"
            width="14"
            height="14"
            rx="6"
            stroke="currentColor"
            strokeWidth="1.9"
          />
          <path
            d="M23 13h4M23 17h4M23 21h3"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      );

    case "charger":
      return (
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M12 7v5M20 7v5M10 11h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-6Z"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 22v5"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return null;
  }
}
