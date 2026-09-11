import React from "react";
import "./BranchesSection.css";

/**
 * Anis Phone Store - Branches & Benefits
 *
 * The branch data is static for now and can be replaced with backend data later.
 *
 * Usage:
 * <BranchesSection language={language} />
 */
export default function BranchesSection({
  language = "en",
  onExploreBranches,
  onBranchClick,
}) {
  const isArabic = language === "ar";

  const content = {
    en: {
      branchLabel: "Anis Phone Store Branches",
      title: "Visit Anis Phone Store near you — trusted service and exclusive experience",
      description:
        "Explore our branches to find the latest smart devices and accessories, with reliable service and expert support for all your needs.",
      explore: "Explore Branches & Locations",
      openNow: "Open Now",

      branches: [
        {
          id: "qasr",
          name: "Al-Qasr Street Branch",
          location: "Aden - Al-Mansoura - Al-Qasr Street",
        },
        {
          id: "ninety-mall",
          name: "Ninety Mall Branch",
          location: "Ninety Mall - First Floor",
        },
        {
          id: "ostoura-mall",
          name: "Al-Ostoura Mall Branch",
          location: "Al-Ostoura Mall - Second Floor",
        },
      ],

      benefits: [
        {
          id: "warranty",
          title: "Two-Year Warranty",
          description: "Comprehensive coverage against manufacturing defects",
          icon: "shield",
        },
        {
          id: "vip",
          title: "VIP Fast Delivery",
          description: "Delivery within hours in major cities",
          icon: "truck",
        },
        {
          id: "tradein",
          title: "Trade-In Program",
          description: "Exchange your old device and get an immediate valuation",
          icon: "trade",
        },
        {
          id: "support",
          title: "Dedicated Technical Support",
          description: "Our team is ready to help with setup, data transfer, and settings",
          icon: "support",
        },
      ],
    },

    ar: {
      branchLabel: "فروع أنس فون المعتمدة",
      title: "فروع أنس فون العربية صارت تجربة تسوق ملموسة وخدمة استثنائية",
      description:
        "زورونا في فروعنا لتجربة أحدث الأجهزة الذكية والاستفادة من استشارات شرائنا وخدمات الصيانة والضمان المباشرة مع استبدال مجاني بدل دقائق.",
      explore: "استكشف الفروع ومواقعها",
      openNow: "مفتوح الآن",

      branches: [
        {
          id: "qasr",
          name: "فرع شارع القصر",
          location: "عدن - المنصورة - شارع القصر",
        },
        {
          id: "ninety-mall",
          name: "فرع ناينتي مول",
          location: "ناينتي مول - الدور الأول",
        },
        {
          id: "ostoura-mall",
          name: "فرع الأسطورة مول",
          location: "الأسطورة مول - الدور الثاني",
        },
      ],

      benefits: [
        {
          id: "warranty",
          title: "ضمان ذهبي سنتين",
          description: "تغطية شاملة ضد العيوب التصنيعية واستبدال فوري",
          icon: "shield",
        },
        {
          id: "vip",
          title: "توصيل سريع VIP",
          description: "توصيل خلال ساعات بنفس اليوم في المدن الرئيسية",
          icon: "truck",
        },
        {
          id: "tradein",
          title: "برنامج التبديل Trade-In",
          description: "استبدل جهازك القديم بأعلى تقييم فوري مع الاستلام",
          icon: "trade",
        },
        {
          id: "support",
          title: "مستشار تقني مخصص",
          description: "دعم شخصي لمساعدتك في نقل البيانات وضبط الإعدادات",
          icon: "support",
        },
      ],
    },
  };

  const current = isArabic ? content.ar : content.en;

  return (
    <section
      className={`branches-section ${isArabic ? "rtl" : "ltr"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="branches-panel">
        <div className="branches-layout">
          {/* Branches list */}
          <div className="branches-list">
            {current.branches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                className="branch-card"
                onClick={() => onBranchClick?.(branch.id)}
              >
                <span className="branch-content">
                  <span className="branch-name">{branch.name}</span>
                  <span className="branch-location">{branch.location}</span>
                </span>

                <span className="branch-location-icon">
                  <LocationIcon />
                </span>

                <span className="branch-open">
                  {current.openNow}
                </span>
              </button>
            ))}
          </div>

          {/* Intro / CTA */}
          <div className="branches-intro">
            <span className="branches-label">
              <StoreIcon />
              {current.branchLabel}
            </span>

            <h2>{current.title}</h2>

            <p>{current.description}</p>

            <button
              type="button"
              className="explore-button"
              onClick={onExploreBranches}
            >
              <span>{current.explore}</span>
              <MapIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="benefits-panel">
        <div className="benefits-grid">
          {current.benefits.map((benefit) => (
            <article className="benefit-item" key={benefit.id}>
              <span className="benefit-icon">
                <BenefitIcon type={benefit.icon} />
              </span>

              <span className="benefit-content">
                <strong>{benefit.title}</strong>
                <span>{benefit.description}</span>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ========================================
   ICONS
======================================== */

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="10"
        r="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10h16M5 10v9h14v-9M7 19v-5h4v5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m4 10 1.7-5h12.6L20 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 4v14M15 6v14"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function BenefitIcon({ type }) {
  if (type === "shield") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3 19 6v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="m9 12 2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "truck") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 6h11v10H3zM14 10h4l3 3v3h-7z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="18" cy="18" r="1.7" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  if (type === "trade") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7 7h10l-2.5-2.5M17 17H7l2.5 2.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 7a5 5 0 0 1 2 4M7 17a5 5 0 0 1-2-4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 17a4 4 0 0 0-3.2-3.9A5 5 0 0 0 7.2 15 3.5 3.5 0 0 0 7 22h10a3 3 0 0 0 3-3v-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M9 18h6M12 15v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
