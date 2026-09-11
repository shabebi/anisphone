import React from "react";
import "./Footer.css";

/**
 * Anis Phone Store - Footer
 *
 * Static bilingual footer for now.
 * Pass the same `language` state used by the rest of the app.
 *
 * Example:
 * <Footer
 *   language={language}
 *   onNavigate={(page) => console.log("Navigate:", page)}
 * />
 */
export default function Footer({
  language = "en",
  onNavigate,
  onSocialClick,
}) {
  const isArabic = language === "ar";

  const content = {
    en: {
      description:
        "Premier authorized destination for luxury smartphones and accessories in Saudi Arabia.",
      quickLinksTitle: "QUICK LINKS",
      serviceTitle: "CUSTOMER SERVICE & WARRANTY",
      quickLinks: [
        ["home", "Home"],
        ["smartphones", "Smartphones"],
        ["deals", "Deals & Discounts"],
        ["branches", "Branches & Stores"],
        ["orders", "Order Tracking"],
      ],
      serviceLinks: [
        ["warranty", "2-Year Golden Warranty"],
        ["support", "Direct Tech Support"],
        ["returns", "Return & Exchange Policy"],
        ["faq", "FAQ"],
        ["shipping", "Fast Shipping Policy"],
      ],
      copyright: "© 2026 Anis Phone Store. All rights reserved.",
      socials: {
        whatsapp: "WhatsApp",
        hashtag: "Social",
        instagram: "Instagram",
        messages: "Contact",
      },
    },

    ar: {
      description:
        "الوجهة الرائدة للأجهزة الذكية الفاخرة وملحقاتها المعتمدة في المملكة العربية السعودية.",
      quickLinksTitle: "روابط سريعة",
      serviceTitle: "خدمة العملاء والضمان",
      quickLinks: [
        ["home", "الرئيسية"],
        ["smartphones", "الهواتف الذكية"],
        ["deals", "العروض والخصومات"],
        ["branches", "الفروع والمواقع"],
        ["orders", "تتبع الطلبات"],
      ],
      serviceLinks: [
        ["warranty", "الضمان الذهبي سنتين"],
        ["support", "الدعم الفني المباشر"],
        ["returns", "سياسة الاستبدال والاسترجاع"],
        ["faq", "الأسئلة الشائعة FAQ"],
        ["shipping", "الشحن والتوصيل السريع"],
      ],
      copyright: "© 2026 أنس فون. جميع الحقوق محفوظة.",
      socials: {
        whatsapp: "واتساب",
        hashtag: "التواصل",
        instagram: "إنستغرام",
        messages: "تواصل معنا",
      },
    },
  };

  const current = isArabic ? content.ar : content.en;

  const handleNavigate = (page) => {
    onNavigate?.(page);
  };

  return (
    <footer
      className={`anis-footer ${isArabic ? "rtl" : "ltr"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="footer-main">
        {/* Brand / description */}
        <div className="footer-brand-column">
          <button
            type="button"
            className="footer-logo"
            onClick={() => handleNavigate("home")}
            aria-label="Anis Phone Store"
          >
            <span className="footer-logo-mark" aria-hidden="true">
              <LogoIcon />
            </span>

            <span className="footer-logo-copy">
              <strong>أنس فون</strong>
              <small>ANIS PHONE STORE</small>
            </span>
          </button>

          <p className="footer-description">{current.description}</p>

          <div className="footer-socials">
            <button
              type="button"
              aria-label={current.socials.messages}
              onClick={() => onSocialClick?.("messages")}
            >
              <MessageIcon />
            </button>

            <button
              type="button"
              aria-label={current.socials.instagram}
              onClick={() => onSocialClick?.("instagram")}
            >
              <InstagramIcon />
            </button>

            <button
              type="button"
              aria-label={current.socials.hashtag}
              onClick={() => onSocialClick?.("social")}
            >
              <HashtagIcon />
            </button>

            <button
              type="button"
              aria-label={current.socials.whatsapp}
              onClick={() => onSocialClick?.("whatsapp")}
            >
              <PhoneIcon />
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="footer-link-column">
          <h3>{current.quickLinksTitle}</h3>

          <nav aria-label={current.quickLinksTitle}>
            {current.quickLinks.map(([id, label]) => (
              <button
                type="button"
                key={id}
                onClick={() => handleNavigate(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Customer service */}
        <div className="footer-link-column">
          <h3>{current.serviceTitle}</h3>

          <nav aria-label={current.serviceTitle}>
            {current.serviceLinks.map(([id, label]) => (
              <button
                type="button"
                key={id}
                onClick={() => handleNavigate(id)}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <p>{current.copyright}</p>
      </div>
    </footer>
  );
}


/* ========================================
   ICONS
======================================== */

function LogoIcon() {
  return (
    <svg viewBox="0 0 42 48" fill="none" aria-hidden="true">
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
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 5.5h14v10H9l-4 3v-13Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8 9h8M8 12h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="4.5"
        y="4.5"
        width="15"
        height="15"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle
        cx="12"
        cy="12"
        r="3.3"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="16.8" cy="7.4" r="1" fill="currentColor" />
    </svg>
  );
}

function HashtagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 4 7 20M17 4l-2 16M4.5 9h16M3.5 15h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.7 4.5 9.2 7l-1.7 2.2c1 2.2 2.3 3.5 4.5 4.5l2.2-1.7 2.5 2.5c.5.5.6 1.2.2 1.8l-1.1 1.6c-.4.6-1.1.9-1.8.8-6.2-1-10.4-5.2-11.4-11.4-.1-.7.2-1.4.8-1.8L5 4.4c.5-.4 1.2-.3 1.7.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
