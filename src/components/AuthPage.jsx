import { useEffect, useState } from "react";
import "./AuthPage.css";
import logo from "../assets/logo.png";

const API =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/v1"
    : "https://anisphone.onrender.com/api/v1";

export default function AuthPage({
  onAuthenticated,
  language = "ar",
  onLanguageChange,
}) {
  const isArabic = language === "ar";

  const [mode, setMode] = useState("login");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = isArabic ? "ar" : "en";

    return () => {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "en";
    };
  }, [isArabic]);

  const change = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const cleaned = value.replace(/\D/g, "").slice(0, 9);

      setForm((x) => ({
        ...x,
        phone: cleaned,
      }));

      return;
    }

    setForm((x) => ({
      ...x,
      [name]: value,
    }));
  };

  const toggleLanguage = () => {
    const newLanguage = isArabic ? "en" : "ar";

    localStorage.setItem("anis_language", newLanguage);

    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  async function submit(e) {
    e.preventDefault();

    setError("");

    if (!/^7\d{8}$/.test(form.phone)) {
      setError(
        isArabic
          ? "أدخل رقم هاتف يمني صحيح مكون من 9 أرقام ويبدأ بالرقم 7."
          : "Enter a valid Yemeni phone number with 9 digits starting with 7."
      );

      return;
    }

    if (form.password.length < 6) {
      setError(
        isArabic
          ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
          : "Password must be at least 6 characters."
      );

      return;
    }

    if (mode === "register" && !form.name.trim()) {
      setError(
        isArabic
          ? "يرجى إدخال الاسم الكامل."
          : "Please enter your full name."
      );

      return;
    }

    setBusy(true);

    try {
      const r = await fetch(
        `${API}/auth/${mode === "login" ? "login" : "register"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const j = await r.json();

      if (!r.ok) {
        throw new Error(
          j.message ||
            (isArabic
              ? "حدث خطأ ما."
              : "Something went wrong.")
        );
      }

      // Save authentication token
      localStorage.setItem("anis_token", j.data.token);

      const user = j.data.user;

      // ADMIN → Admin dashboard
      if (user?.role === "admin") {
        const base = import.meta.env.BASE_URL.replace(/\/$/, "");

        window.location.href = `${base}/admin/`;

        return;
      }

      // NORMAL CUSTOMER → continue normally
      onAuthenticated(user);
    } catch (x) {
      setError(
        x.message ||
          (isArabic
            ? "حدث خطأ أثناء تسجيل الدخول."
            : "An error occurred while signing in.")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="auth-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="auth-glow" />

      <div className="auth-card">

        {/* Language */}
        <button
          type="button"
          className="auth-language-toggle"
          onClick={toggleLanguage}
        >
          {isArabic ? "EN" : "العربية"}
        </button>

        {/* Brand */}
        <div className="auth-brand">
          <img src={logo} alt="Anis Phone" />

          <span>
            <strong>
              {isArabic ? "أنيس فون" : "ANIS PHONE"}
            </strong>

            <small>
              {isArabic
                ? "تقنية متميزة"
                : "PREMIUM TECHNOLOGY"}
            </small>
          </span>
        </div>

        {/* Heading */}
        <p className="auth-kicker">
          {isArabic ? "حسابك" : "YOUR ACCOUNT"}
        </p>

        <h1>
          {mode === "login"
            ? isArabic
              ? "مرحباً بعودتك"
              : "Welcome back"
            : isArabic
              ? "أنشئ حسابك"
              : "Create your account"}
        </h1>

        <p className="auth-copy">
          {mode === "login"
            ? isArabic
              ? "سجل الدخول لمتابعة التسوق مع أنيس فون."
              : "Sign in to continue shopping with Anis Phone."
            : isArabic
              ? "انضم إلى أنيس فون لتجربة أسرع وأكثر خصوصية."
              : "Join Anis Phone for a faster, more personal experience."}
        </p>

        {/* Login / Signup */}
        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            {isArabic ? "تسجيل الدخول" : "Log in"}
          </button>

          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            {isArabic ? "إنشاء حساب" : "Sign up"}
          </button>
        </div>

        <form onSubmit={submit}>

          {/* Name */}
          {mode === "register" && (
            <label>
              {isArabic ? "الاسم الكامل" : "Full name"}

              <input
                name="name"
                required
                value={form.name}
                onChange={change}
                placeholder={
                  isArabic
                    ? "أدخل اسمك"
                    : "Your name"
                }
              />
            </label>
          )}

          {/* Phone */}
          <label>
            {isArabic
              ? "رقم الهاتف"
              : "Phone number"}

            <div className="auth-phone-input">
              <span className="auth-phone-prefix">
                +967
              </span>

              <input
                name="phone"
                required
                value={form.phone}
                onChange={change}
                placeholder="7xxxxxxxx"
                inputMode="numeric"
                type="tel"
                maxLength={9}
                pattern="7[0-9]{8}"
                autoComplete="tel"
              />
            </div>

            <small className="auth-field-hint">
              {isArabic
                ? "9 أرقام تبدأ بالرقم 7"
                : "9 digits starting with 7"}
            </small>
          </label>

          {/* Password */}
          <label>
            {isArabic
              ? "كلمة المرور"
              : "Password"}

            <input
              name="password"
              required
              minLength="6"
              value={form.password}
              onChange={change}
              type="password"
              placeholder={
                isArabic
                  ? "6 أحرف على الأقل"
                  : "At least 6 characters"
              }
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
            />
          </label>

          {/* Error */}
          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="auth-submit"
            disabled={busy}
          >
            {busy
              ? isArabic
                ? "يرجى الانتظار…"
                : "Please wait…"
              : mode === "login"
                ? isArabic
                  ? "تسجيل الدخول"
                  : "Log in"
                : isArabic
                  ? "إنشاء الحساب"
                  : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}