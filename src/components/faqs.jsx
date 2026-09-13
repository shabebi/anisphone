import { useEffect, useState } from "react";
import "./faqs.css";

const API_URL = "http://localhost:5000/api/v1";

export default function FAQs({ language = "en", onBack }) {
  const isArabic = language === "ar";
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const content = isArabic
    ? {
        eyebrow: "مركز المساعدة",
        title: "الأسئلة الشائعة",
        subtitle: "اعثر على إجابات سريعة حول الطلبات والشحن والضمان وخدمات أنيس فون.",
        back: "الرئيسية",
        loading: "جارٍ تحميل الأسئلة الشائعة...",
        empty: "لا توجد أسئلة شائعة متاحة حالياً.",
        error: "تعذر تحميل الأسئلة الشائعة. يرجى المحاولة مرة أخرى.",
        retry: "إعادة المحاولة",
      }
    : {
        eyebrow: "HELP CENTER",
        title: "Frequently Asked Questions",
        subtitle: "Find quick answers about orders, delivery, warranty, and Anis Phone services.",
        back: "Home",
        loading: "Loading frequently asked questions...",
        empty: "There are no frequently asked questions available yet.",
        error: "We could not load the frequently asked questions. Please try again.",
        retry: "Try again",
      };

  useEffect(() => {
    const controller = new AbortController();

    async function loadFaqs() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(`${API_URL}/content/faqs`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Failed to load FAQs");

        const result = await response.json();
        setFaqs(result.data || []);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          console.error(loadError);
          setError(true);
          setFaqs([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadFaqs();
    return () => controller.abort();
  }, []);

  function retry() {
    setLoading(true);
    setError(false);
    fetch(`${API_URL}/content/faqs`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load FAQs");
        return response.json();
      })
      .then((result) => setFaqs(result.data || []))
      .catch((loadError) => {
        console.error(loadError);
        setError(true);
      })
      .finally(() => setLoading(false));
  }

  return (
    <section className={`faqs-page ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"}>
      <div className="faqs-page-inner">
        <header className="faqs-page-header">
          <button type="button" className="faqs-back-button" onClick={onBack}>
            <ArrowIcon />
            <span>{content.back}</span>
          </button>

          <div className="faqs-page-intro">
            <span className="faqs-eyebrow">{content.eyebrow}</span>
            <h1>{content.title}</h1>
            <p>{content.subtitle}</p>
          </div>
        </header>

        <div className="faqs-list" aria-busy={loading}>
          {loading ? (
            [1, 2, 3, 4].map((item) => <div className="faq-skeleton" key={item} aria-hidden="true" />)
          ) : error ? (
            <div className="faqs-message">
              <p>{content.error}</p>
              <button type="button" onClick={retry}>{content.retry}</button>
            </div>
          ) : faqs.length === 0 ? (
            <div className="faqs-message"><p>{content.empty}</p></div>
          ) : (
            faqs.map((faq) => {
              const isOpen = openId === faq.id;
              const question = isArabic ? faq.question_ar : faq.question_en;
              const answer = isArabic ? faq.answer_ar : faq.answer_en;
              const panelId = `faq-answer-${faq.id}`;

              return (
                <article className={`faq-item ${isOpen ? "open" : ""}`} key={faq.id}>
                  <h2>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                    >
                      <span>{question}</span>
                      <ChevronIcon />
                    </button>
                  </h2>
                  <div id={panelId} className="faq-answer" hidden={!isOpen}>
                    <p>{answer}</p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m5-5-5 5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function ChevronIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 9 5 5 5-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
