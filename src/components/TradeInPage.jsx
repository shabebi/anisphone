import { useEffect, useState } from "react";
import "./TradeInPage.css";

const API_URL =
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/v1"
    : "https://anisphone.onrender.com/api/v1";

const translations = {
  ar: {
    title: "استبدل جهازك",
    subtitle: "أخبرنا عن جهازك وسنتواصل معك لتقييمه وعرض قيمة الاستبدال.",
    deviceData: "بيانات الجهاز",
    deviceType: "اختر نوع الجهاز",
    brand: "اختر العلامة التجارية",
    model: "اختر نوع الموديل",
    storage: "اختر السعة",
    condition: "حالة الجهاز",
    accountFree: "الجهاز خالي من الحسابات الشخصية والأرقام السرية (جوجل - أبل، قفل نمط الشاشة، قفل الشبكة، قفل الشريحة...)؟",
    working: "الجهاز يقبل التشغيل وخالي من أي أعطال مصنعية؟",
    surface: "الشاشة والجهاز خاليان من الخدوش السطحية؟",
    deepScreen: "الشاشة خالية من أي خدوش عميقة، نقاط، بقع أو ألوان غير طبيعية؟",
    body: "جسم الجهاز خالي من الخدوش العميقة والضربات؟",
    complete: "الجهاز خالي من الكسور، الفجوات في الهيكل، ولا يوجد نقص في الأزرار والقطع، وحامل الشريحة متوفر؟",
    battery: "الحد الأقصى لقدرة البطارية",
    batteryPlaceholder: "مثال: 87%",
    contact: "الاستعلام والتواصل",
    name: "اسمك",
    namePlaceholder: "أدخل اسمك",
    phone: "رقم التواصل",
    phonePlaceholder: "7XXXXXXXX",
    notes: "ملاحظات إضافية",
    notesPlaceholder: "أي تفاصيل أخرى عن الجهاز...",
    submit: "إرسال طلب الاستبدال",
    sending: "جاري الإرسال...",
    required: "يرجى إكمال الحقول المطلوبة.",
    success: "تم إرسال طلب الاستبدال بنجاح. سنتواصل معك قريباً.",
    error: "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.",
    yes: "نعم",
    no: "لا",
    smartPhone: "هاتف ذكي",
    watch: "ساعة ذكية",
    tablet: "تابلت",
    laptop: "لابتوب",
    apple: "أبل",
    samsung: "سامسونج",
    other: "أخرى",
  },
  en: {
    title: "Trade In Your Device",
    subtitle: "Tell us about your device and we'll contact you to evaluate it and provide a trade-in offer.",
    deviceData: "Device Information",
    deviceType: "Choose device type",
    brand: "Choose brand",
    model: "Choose model",
    storage: "Choose storage",
    condition: "Device Condition",
    accountFree: "Is the device free from personal accounts and security locks (Google, Apple, screen lock, network lock, SIM lock, etc.)?",
    working: "Does the device power on and have no manufacturing faults?",
    surface: "Are the screen and device free from surface scratches?",
    deepScreen: "Is the screen free from deep scratches, spots, marks, or abnormal colors?",
    body: "Is the body free from deep scratches and dents?",
    complete: "Is the device free from cracks, gaps in the body, missing buttons/parts, and does it include the SIM tray?",
    battery: "Maximum battery capacity",
    batteryPlaceholder: "Example: 87%",
    contact: "Contact Information",
    name: "Your Name",
    namePlaceholder: "Enter your name",
    phone: "Contact Number",
    phonePlaceholder: "7XXXXXXXX",
    notes: "Additional Notes",
    notesPlaceholder: "Any other details about the device...",
    submit: "Submit Trade-In Request",
    sending: "Sending...",
    required: "Please complete the required fields.",
    success: "Your trade-in request was submitted successfully. We'll contact you soon.",
    error: "Something went wrong while sending your request. Please try again.",
    yes: "Yes",
    no: "No",
    smartPhone: "Smartphone",
    watch: "Smartwatch",
    tablet: "Tablet",
    laptop: "Laptop",
    apple: "Apple",
    samsung: "Samsung",
    other: "Other",
  },
};

const EMPTY_FORM = {
  device_type: "",
  brand: "",
  model: "",
  storage: "",
  account_free: null,
  working: null,
  surface_condition: null,
  screen_condition: null,
  body_condition: null,
  complete: null,
  battery_capacity: "",
  notes: "",
};

export default function TradeInPage({
  language = "ar",
  user,
}) {
  const isArabic = language === "ar";
  const t = translations[language] || translations.ar;

  const [form, setForm] = useState({
    device_type: "",
    brand: "",
    model: "",
    storage: "",
    account_free: null,
    working: null,
    surface_condition: null,
    screen_condition: null,
    body_condition: null,
    complete: null,
    battery_capacity: "",
    notes: "",
  });

  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [catalog, setCatalog] = useState({
    device_types: [],
    brands: [],
    models: [],
    storage_options: [],
  });
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalog() {
      try {
        setCatalogLoading(true);
        const response = await fetch(`${API_URL}/trade-in/catalog`);
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result?.message || "Failed to load trade-in options");
        }

        const data = result?.data || result || {};

        if (!cancelled) {
          setCatalog({
            device_types: Array.isArray(data.device_types) ? data.device_types : [],
            brands: Array.isArray(data.brands) ? data.brands : [],
            models: Array.isArray(data.models) ? data.models : [],
            storage_options: Array.isArray(data.storage_options) ? data.storage_options : [],
          });
        }
      } catch (error) {
        console.error("Trade-in catalog error:", error);
        if (!cancelled) setStatus("catalog-error");
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    }

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDeviceType = catalog.device_types.find(
    (item) => String(item.id) === String(form.device_type)
  );

  const availableBrands = catalog.brands.filter(
    (item) => String(item.device_type_id) === String(form.device_type)
  );

  const availableModels = catalog.models.filter(
    (item) =>
      String(item.device_type_id) === String(form.device_type) &&
      String(item.brand_id) === String(form.brand)
  );

  const availableStorage = catalog.storage_options.filter(
    (item) =>
      String(item.device_type_id) === String(form.device_type)
  );

  const setField = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setStatus("");
  };

  const handleDeviceTypeChange = (value) => {
    setForm((previous) => ({
      ...previous,
      device_type: value,
      brand: "",
      model: "",
      storage: "",
    }));
    setStatus("");
  };

  const handleBrandChange = (value) => {
    setForm((previous) => ({
      ...previous,
      brand: value,
      model: "",
      storage: "",
    }));
    setStatus("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const required =
      form.device_type &&
      form.brand &&
      form.model &&
      (!selectedDeviceType?.has_storage || form.storage) &&
      form.account_free !== null &&
      form.working !== null &&
      form.surface_condition !== null &&
      form.screen_condition !== null &&
      form.body_condition !== null &&
      form.complete !== null &&
      form.battery_capacity &&
      user?.name &&
      user?.phone;

    if (!required) {
      setStatus("required");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSubmitting(true);
      setStatus("");

      const token = localStorage.getItem("anis_token");

      const response = await fetch(`${API_URL}/trade-ins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...form,
          device_type:
            selectedDeviceType?.name_en ||
            selectedDeviceType?.name_ar ||
            form.device_type,

          brand:
            availableBrands.find(
              (item) => String(item.id) === String(form.brand)
            )?.name_en ||
            availableBrands.find(
              (item) => String(item.id) === String(form.brand)
            )?.name_ar ||
            form.brand,

          model:
            availableModels.find(
              (item) => String(item.id) === String(form.model)
            )?.name_en ||
            availableModels.find(
              (item) => String(item.id) === String(form.model)
            )?.name_ar ||
            form.model,
          language,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "Trade-in request failed");
      }

      setStatus("success");
      setForm({ ...EMPTY_FORM });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Trade-in submission error:", error);
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const conditionQuestions = [
    ["account_free", t.accountFree],
    ["working", t.working],
    ["surface_condition", t.surface],
    ["screen_condition", t.deepScreen],
    ["body_condition", t.body],
    ["complete", t.complete],
  ];

  return (
    <main
      className={`trade-in-page ${isArabic ? "rtl" : "ltr"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <section className="trade-in-hero">
        <div className="trade-in-eyebrow">ANIS PHONE</div>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>

      </section>

      <form className="trade-in-form" onSubmit={handleSubmit}>
        {status && (
          <div className={`trade-in-status ${status}`}>
            {status === "success"
              ? t.success
              : status === "required"
                ? t.required
                : status === "catalog-error"
                  ? (isArabic ? "تعذر تحميل خيارات الاستبدال. حاول مرة أخرى." : "Could not load trade-in options. Please try again.")
                  : t.error}
          </div>
        )}

        <section className="trade-in-card">
          <div className="trade-in-section-heading">
            <span>01</span>
            <div>
              <h2>{t.deviceData}</h2>
            </div>
          </div>

          <div className="trade-in-grid">
            <label>
              <span>{t.deviceType}</span>
              <select
                value={form.device_type}
                onChange={(e) => handleDeviceTypeChange(e.target.value)}
                disabled={catalogLoading}
              >
                <option value="">
                  {catalogLoading
                    ? (isArabic ? "جاري تحميل الأنواع..." : "Loading device types...")
                    : t.deviceType}
                </option>
                {catalog.device_types.map((item) => (
                  <option key={item.id} value={item.id}>
                    {isArabic ? item.name_ar : item.name_en}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{t.brand}</span>
              <select
                value={form.brand}
                onChange={(e) => handleBrandChange(e.target.value)}
                disabled={!form.device_type || catalogLoading}
              >
                <option value="">{t.brand}</option>
                {availableBrands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {isArabic ? item.name_ar : item.name_en}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{t.model}</span>
              <select
                value={form.model}
                onChange={(e) => setField("model", e.target.value)}
                disabled={!form.brand || catalogLoading}
              >
                <option value="">{t.model}</option>
                {availableModels.map((item) => (
                  <option key={item.id} value={item.id}>
                    {isArabic ? item.name_ar : item.name_en}
                  </option>
                ))}
              </select>
            </label>

            {selectedDeviceType?.has_storage && (
              <label>
                <span>{t.storage}</span>
                <select
                  value={form.storage}
                  onChange={(e) => setField("storage", e.target.value)}
                  disabled={!form.device_type || catalogLoading}
                >
                  <option value="">{t.storage}</option>
                  {availableStorage.map((item) => (
                    <option key={item.id} value={item.value}>
                      {item.value}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </section>

        <section className="trade-in-card">
          <div className="trade-in-section-heading">
            <span>02</span>
            <div>
              <h2>{t.condition}</h2>
            </div>
          </div>

          <div className="trade-in-questions">
            {conditionQuestions.map(([key, question], index) => (
              <div className="trade-in-question" key={key}>
                <div className="trade-in-question-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <p>{question}</p>

                <div className="trade-in-choice">
                  <button
                    type="button"
                    className={form[key] === true ? "selected" : ""}
                    onClick={() => setField(key, true)}
                  >
                    {t.yes}
                  </button>
                  <button
                    type="button"
                    className={form[key] === false ? "selected" : ""}
                    onClick={() => setField(key, false)}
                  >
                    {t.no}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label className="trade-in-battery">
            <span>{t.battery}</span>
            <input
              type="text"
              inputMode="numeric"
              value={form.battery_capacity}
              onChange={(e) => setField("battery_capacity", e.target.value)}
              placeholder={t.batteryPlaceholder}
              maxLength={4}
            />
          </label>
        </section>

        <section className="trade-in-card">
          <div className="trade-in-section-heading">
            <span>03</span>
            <div>
              <h2>{t.contact}</h2>
            </div>
          </div>

          <div className="trade-in-grid">
            <label>
              <span>{t.name}</span>
              <input
                type="text"
                value={user?.name || ""}
                readOnly
                autoComplete="name"
              />
            </label>

            <label>
              <span>{t.phone}</span>
              <div className="trade-in-phone">
                <span>+967</span>
                <input
                  type="tel"
                  value={user?.phone || ""}
                  readOnly
                  dir="ltr"
                  autoComplete="tel"
                />
              </div>
            </label>

            <label className="trade-in-full">
              <span>{t.notes}</span>
              <textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={5}
              />
            </label>
          </div>
        </section>

        <button className="trade-in-submit" type="submit" disabled={submitting}>
          {submitting ? t.sending : t.submit}
          <span>{isArabic ? "←" : "→"}</span>
        </button>
      </form>
    </main>
  );
}
