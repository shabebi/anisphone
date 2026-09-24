import { useEffect, useState } from "react";
import "./CategorySection.css";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

function categoryImageClass(category) {
  const value = `${category?.slug || ""} ${category?.name_en || ""} ${category?.name_ar || ""}`.toLowerCase();

  if (/(phone|phones|smartphone|smartphones|هاتف|هواتف|جوال|جوالات)/.test(value)) {
    return "category-image-phones";
  }
  if (/(computer|computers|laptop|laptops|pc|كمبيوتر|حاسوب|لابتوب)/.test(value)) {
    return "category-image-computers";
  }
  if (/(tablet|tablets|ipad|تابلت|ايباد|آيباد)/.test(value)) {
    return "category-image-tablets";
  }
  if (/(headphone|headphones|earbuds|audio|سماعة|سماعات|ايربود|إيربود)/.test(value)) {
    return "category-image-headphones";
  }
  if (/(watch|watches|smartwatch|ساعة|ساعات)/.test(value)) {
    return "category-image-watches";
  }
  if (/(accessor|accessories|case|cases|charger|كفر|كفرات|اكسسوار|إكسسوار|إكسسوارات|شاحن)/.test(value)) {
    return "category-image-accessories";
  }

  return "";
}

export default function CategorySection({ language = "ar", onCategoryClick }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API}/products/categories`);
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result?.message || "Failed to load categories");
        }

        const data = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        if (!cancelled) setCategories(data);
      } catch (e) {
        if (!cancelled) {
          setCategories([]);
          setError(e.message || "Failed to load categories");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const getName = (category) =>
    language === "en"
      ? category.name_en || category.name_ar || category.slug
      : category.name_ar || category.name_en || category.slug;

  if (!loading && !categories.length && !error) return null;

  return (
    <section
      className={`category-section ${language === "ar" ? "rtl" : ""}`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="category-heading">
        <span className="category-eyebrow">
          {language === "en" ? "EXPLORE" : "استكشف"}
        </span>
        <h2>{language === "en" ? "Shop by Category" : "تسوق حسب التصنيف"}</h2>
      </div>

      {error ? (
        <div className="categories-error">{error}</div>
      ) : loading ? (
        <div className="category-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="category-card category-skeleton" key={index} />
          ))}
        </div>
      ) : (
        <div className="category-grid">
          {categories.map((category) => {
            const imageClass = categoryImageClass(category);

            return (
              <button
                type="button"
                className="category-card"
                key={category.id || category.slug}
                onClick={() => onCategoryClick?.(category.slug || category.id)}
              >
                {category.image ? (
                  <img
                    className={`category-image ${imageClass}`.trim()}
                    src={category.image}
                    alt={getName(category)}
                    loading="lazy"
                  />
                ) : null}

                <div className="category-card-overlay">
                  <span className="category-name">{getName(category)}</span>
                  <span className="category-browse">
                    {language === "en" ? "BROWSE" : "تصفح"}
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        d="M5 12h13M13 6l6 6-6 6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
