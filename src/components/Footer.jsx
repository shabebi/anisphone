import React from "react";
import "./Footer.css";
import logo from "../assets/logo.png";

const LINKS = {
  facebook: "https://facebook.com/107862220810344",
  whatsapp: "https://wa.me/96702350567",
  phone: "tel:+9672350567",
  mobile: "tel:+967779999195",
  email: "mailto:anisfonstore@gmail.com",
};

export default function Footer({
  language = "en",
  onNavigate,
}) {
  const isArabic = language === "ar";

  const content = {
    en: {
      description:
        "Anis Phone is an Aden-based store for original smartphones, Apple products, and genuine accessories.",
      exploreTitle: "EXPLORE",
      serviceTitle: "CUSTOMER SERVICE",
      contactTitle: "CONTACT US",
      exploreLinks: [
        ["home", "Home"],
        ["products", "All Products"],
        ["deals", "Deals & Discounts"],
        ["branches", "Branches & Stores"],
      ],
      serviceLinks: [
        ["faq", "FAQ"],
        ["rateus", "Rate Us"],
        ["contact", "Contact Us"],
      ],
      contact: {
        phone: "02 350 567",
        mobile: "779 999 195",
        whatsapp: "WhatsApp",
        email: "anisfonstore@gmail.com",
        address:
          "Aden – Al-Mansoura – Al-Qasr Street – Ninety Mall, 1st Floor – Al-Astora Mall, 2nd Floor",
      },
      socials: {
        whatsapp: "WhatsApp",
        facebook: "Facebook",
        email: "Email",
      },
      copyright: "© 2026 Anis Phone. All rights reserved.",
    },

    ar: {
      description:
        "أنيس فون متجر في عدن للهواتف الأصلية ومنتجات آبل والإكسسوارات الأصلية.",
      exploreTitle: "استكشف",
      serviceTitle: "خدمة العملاء",
      contactTitle: "تواصل معنا",
      exploreLinks: [
        ["home", "الرئيسية"],
        ["products", "كافة المنتجات"],
        ["deals", "العروض والخصومات"],
        ["branches", "الفروع والمواقع"],
      ],
      serviceLinks: [
        ["faq", "الأسئلة الشائعة"],
        ["rateus", "قيّمنا"],
        ["contact", "تواصل معنا"],
      ],
      contact: {
        phone: "02 350 567",
        mobile: "779 999 195",
        whatsapp: "واتساب",
        email: "anisfonstore@gmail.com",
      },
      socials: {
        whatsapp: "واتساب",
        facebook: "فيسبوك",
        email: "البريد الإلكتروني",
      },
      copyright: "© 2026 أنيس فون. جميع الحقوق محفوظة.",
    },
  };

  const current = isArabic ? content.ar : content.en;

  const handleNavigate = (page) => {
    onNavigate?.(page);
  };

  const openExternal = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <footer
      id="site-footer"
      className={`anis-footer ${isArabic ? "rtl" : "ltr"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="footer-main">
        {/* BRAND */}
        <div className="footer-brand-column">
          <button
            type="button"
            className="footer-logo"
            onClick={() => handleNavigate("home")}
            aria-label="Anis Phone"
          >
            <span className="footer-logo-mark">
              <img src={logo} alt="Anis Phone" />
            </span>

            <span className="footer-logo-copy">
              <strong>أنيس فون</strong>
              <small>ANIS PHONE STORE</small>
            </span>
          </button>

          <p className="footer-description">
            {current.description}
          </p>

          {/* VERIFIED SOCIAL / CONTACT LINKS */}
          <div className="footer-socials">
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={current.socials.whatsapp}
              title={current.socials.whatsapp}
            >
              <WhatsAppIcon />
            </a>

            <a
              href={LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={current.socials.facebook}
              title={current.socials.facebook}
            >
              <FacebookIcon />
            </a>

            <a
              href={LINKS.email}
              aria-label={current.socials.email}
              title={current.socials.email}
            >
              <EmailIcon />
            </a>
          </div>
        </div>

        {/* EXPLORE */}
        <div className="footer-link-column">
          <h3>{current.exploreTitle}</h3>

          <nav aria-label={current.exploreTitle}>
            {current.exploreLinks.map(([id, label]) => (
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

        {/* CUSTOMER SERVICE */}
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

        {/* CONTACT */}
        <div className="footer-contact-column">
          <h3>{current.contactTitle}</h3>

          <div className="footer-contact-list">
            <a href={LINKS.phone}>
              <PhoneIcon />
              <span>{current.contact.phone}</span>
            </a>

            <a href={LINKS.mobile}>
              <PhoneIcon />
              <span>{current.contact.mobile}</span>
            </a>

            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon />
              <span>{current.contact.whatsapp}</span>
            </a>

            <a href={LINKS.email}>
              <EmailIcon />
              <span>{current.contact.email}</span>
            </a>

            <button
              type="button"
              className="footer-address"
              onClick={() => openExternal(
                "https://www.google.com/maps/search/?api=1&query=" +
                encodeURIComponent(
                  "Anis Phone Aden Al Mansoura Al Qasr Street Ninety Mall"
                )
              )}
            >
            </button>
          </div>
        </div>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <p>{current.copyright}</p>

        <div className="footer-bottom-right">
          <a
            className="footer-made-by"
            href="https://ebdaa-media.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={isArabic ? "صنع بواسطة إبداع ميديا" : "Made by Ebdaa Media"}
          >
            <span>{isArabic ? "صنع بواسطة" : "Made by"}</span>
            <strong>{isArabic ? "إبداع ميديا" : "Ebdaa Media"}</strong>
            <span className="footer-made-arrow">↗</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
/* ========================================
   FOOTER ICONS
======================================== */

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20.52 3.48A11.85 11.85 0 0 0 12.08 0C5.53 0 .2 5.33.2 11.88c0 2.09.55 4.13 1.59 5.93L.1 24l6.34-1.66a11.88 11.88 0 0 0 5.64 1.43h.01c6.55 0 11.88-5.33 11.88-11.88 0-3.17-1.23-6.15-3.45-8.41ZM12.09 21.7h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.76.99 1-3.67-.23-.38a9.84 9.84 0 0 1-1.51-5.17c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.03 6.96 2.9a9.8 9.8 0 0 1 2.89 6.96c0 5.43-4.42 9.85-9.85 9.85Zm5.4-7.38c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M14.5 8H17V4.5h-2.5C11.46 4.5 9.5 6.35 9.5 9.7V12H7v3.5h2.5V24H13v-8.5h3L16.5 12H13V10c0-.99.4-2 1.5-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M3 12h18M12 3c2.2 2.45 3.3 5.45 3.3 9S14.2 18.55 12 21M12 3C9.8 5.45 8.7 8.45 8.7 12S9.8 18.55 12 21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      fill="none"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M4 7L12 13L20 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.2 3.5 5.7 5c-.8.8-.9 2-.4 3.1a18.2 18.2 0 0 0 10.6 10.6c1.1.5 2.3.4 3.1-.4l1.5-1.5c.6-.6.6-1.6 0-2.2l-2.1-2.1c-.5-.5-1.3-.6-1.9-.2l-1.5.9a1 1 0 0 1-1.1 0 12.4 12.4 0 0 1-4.1-4.1 1 1 0 0 1 0-1.1l.9-1.5c.4-.6.3-1.4-.2-1.9L9.4 3.5c-.6-.6-1.6-.6-2.2 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}