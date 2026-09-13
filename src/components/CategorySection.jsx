import { useEffect, useState } from "react";
import "./CategorySection.css";

const API_URL = "http://localhost:5000/api/v1";
const fallbackCategories = [
  { slug: "phones", name_en: "Smartphones", name_ar: "الهواتف الذكية", icon: "phone" },
  { slug: "computers", name_en: "Laptops & PC", name_ar: "أجهزة الكمبيوتر", icon: "laptop" },
  { slug: "tablets", name_en: "Tablets", name_ar: "الأجهزة اللوحية", icon: "tablet" },
  { slug: "headphones", name_en: "Audio & Headphones", name_ar: "الصوتيات والسماعات", icon: "headphones" },
  { slug: "watches", name_en: "Smartwatches", name_ar: "الساعات الذكية", icon: "watch" },
  { slug: "accessories", name_en: "Accessories & Chargers", name_ar: "الإكسسوارات والشواحن", icon: "charger" },
];
const icons = ["phone", "laptop", "tablet", "headphones", "watch", "charger"];

export default function CategorySection({ language = "en", onCategoryClick }) {
  const isArabic = language === "ar";
  const [categories, setCategories] = useState(fallbackCategories);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/products/categories`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Categories unavailable")))
      .then((result) => { if (result.data?.length) setCategories(result.data); })
      .catch((error) => { if (error.name !== "AbortError") console.error(error); });
    return () => controller.abort();
  }, []);
  const text = isArabic ? { eyebrow: "التصنيفات الرئيسية", title: "تصفح حسب فئة الجهاز", browse: "تسوق الآن" } : { eyebrow: "CORE CATEGORIES", title: "Browse by Device Category", browse: "Shop now" };
  return <section className={`category-section ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"} aria-labelledby="category-section-title">
    <div className="category-heading"><span className="category-eyebrow">{text.eyebrow}</span><h2 id="category-section-title">{text.title}</h2></div>
    <div className="category-grid">{categories.map((category, index) => <button key={category.id || category.slug} type="button" className="category-card" onClick={() => onCategoryClick?.(category.slug)}>
      <span className="category-icon"><CategoryIcon type={category.icon || icons[index % icons.length]} /></span><span className="category-name">{isArabic ? category.name_ar : category.name_en}</span><span className="category-browse">{text.browse} <ArrowIcon /></span>
    </button>)}</div>
  </section>;
}
function CategoryIcon({ type }) { const paths = { phone: <><rect x="9" y="4" width="14" height="24" rx="2" /><path d="M13 7h6M16 24.5h.01" /></>, laptop: <><rect x="7" y="6" width="18" height="14" rx="1.5" /><path d="M4 23h24M10 23l1.5-3h9l1.5 3" /></>, tablet: <><rect x="7" y="4" width="18" height="24" rx="2" /><path d="M9.5 8h13M16 24.5h.01" /></>, headphones: <><path d="M7 17a9 9 0 0 1 18 0" /><path d="M7 16v6a2 2 0 0 0 2 2h2v-8H9a2 2 0 0 0-2 2Zm18 0v6a2 2 0 0 1-2 2h-2v-8h2a2 2 0 0 1 2 2Z" /></>, watch: <><path d="M12 5h8l1 5H11l1-5Zm0 22h8l1-5H11l1 5Z" /><rect x="9" y="9" width="14" height="14" rx="6" /></>, charger: <><path d="M12 7v5m8-5v5M10 11h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-6Z" /><path d="M16 22v5" /></> }; return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>; }
function ArrowIcon() { return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
