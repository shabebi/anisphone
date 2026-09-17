import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  Building2,
  ChevronLeft,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Tags,
  Trash2,
  Users,
  X,
} from "lucide-react";

import "./Admin.css";
import logo from "../assets/logo.png";
import logo1 from "../assets/logowhite.png";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const TOKEN_KEY = "anisphone_admin_token";

const money = (n) =>
  `${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })} $`;

const msg = (e) =>
  e?.response?.data?.message ||
  e?.message ||
  "حدث خطأ غير متوقع";

async function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(isFormData
        ? {}
        : {
          "Content-Type": "application/json",
        }),
      ...(token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "فشل الطلب");
  }

  return data.data ?? data;
}

const nav = [
  ["dashboard", "لوحة التحكم", Home],
  ["products", "المنتجات", ShoppingBag],
  ["categories", "التصنيفات", Tags],
  ["brands", "العلامات التجارية", Building2],
  ["colors", "الألوان", Palette],
  ["inventory", "المخزون", Boxes],
  ["orders", "الطلبات", ClipboardList],
  ["customers", "العملاء", Users],
  ["reviews", "التقييمات", Star],
  ["branches", "الفروع", Building2],
  ["banners", "البنرات", FileText],
  ["faqs", "الأسئلة الشائعة", MessageSquare],
  ["users", "المستخدمون", Shield],
  ["settings", "الإعدادات", Settings],
];

function Login({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      if (data.user?.role !== "admin") {
        throw new Error("هذا الحساب ليس حساب مدير");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.user);
    } catch (e) {
      setError(msg(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ad-login" dir="rtl">
      <div className="ad-login-card">
        <div className="ad-logo">
          <img src={logo} alt="AnisPhone" />
        </div>

        <h1>AnisPhone</h1>
        <p>تسجيل دخول لوحة الإدارة</p>

        <form onSubmit={submit}>
          <label>
            رقم الهاتف
            <input
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>

          <label>
            كلمة المرور
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="ad-error">{error}</div>}

          <button
            className="ad-btn primary"
            disabled={loading}
          >
            {loading ? "جاري الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Shell({
  page,
  setPage,
  user,
  onLogout,
  children,
}) {
  const [open, setOpen] = useState(false);

  const title =
    nav.find((x) => x[0] === page)?.[1] || "لوحة التحكم";

  return (
    <div className="ad-shell" dir="rtl">
      <aside className={`ad-side ${open ? "open" : ""}`}>
        <div className="ad-side-head">
          <div className="ad-logo small">
            <img src={logo1} alt="AnisPhone" />
          </div>

          <div>
            <b>AnisPhone</b>
            <span>لوحة الإدارة</span>
          </div>

          <button
            className="ad-close"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        <div className="ad-side-scroll">
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={page === id ? "active" : ""}
              onClick={() => {
                setPage(id);
                setOpen(false);
              }}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="ad-user">
          <div className="ad-avatar">
            {user?.name?.[0] || "م"}
          </div>

          <div>
            <b>{user?.name || "المدير"}</b>
            <span>مدير النظام</span>
          </div>

          <button onClick={onLogout}>
            <LogOut />
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="ad-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <main className="ad-main">
        <header className="ad-top">
          <button
            className="ad-menu"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <div>
            <span>AnisPhone</span>
            <h1>{title}</h1>
          </div>

          <div className="ad-top-actions">
            <button>
              <RefreshCw />
            </button>

            <div className="ad-top-user">
              {user?.name || "المدير"}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

function Button({
  className,
  children,
  onClick,
  variant = "",
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`ad-btn ${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function Badge({ children, ok = true }) {
  return (
    <span className={`ad-badge ${ok ? "ok" : "bad"}`}>
      {children}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="ad-modal-wrap">
      <div className="ad-modal">
        <div className="ad-modal-head">
          <h3>{title}</h3>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  textarea = false,
  dir,
}) {
  return (
    <label className="ad-field">
      <span>
        {label}
        {required && " *"}
      </span>

      {textarea ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
        />
      ) : (
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          dir={dir}
        />
      )}
    </label>
  );
}

function Bilingual({
  data,
  setData,
  prefix,
  label,
}) {
  return (
    <div className="ad-bi">
      <Field
        label={`${label} بالعربية`}
        value={data[`${prefix}_ar`]}
        onChange={(v) =>
          setData({
            ...data,
            [`${prefix}_ar`]: v,
          })
        }
      />

      <Field
        label={`${label} بالإنجليزية`}
        value={data[`${prefix}_en`]}
        onChange={(v) =>
          setData({
            ...data,
            [`${prefix}_en`]: v,
          })
        }
        dir="ltr"
      />
    </div>
  );
}

function Dashboard({ setPage }) {
  const [s, setS] = useState(null);

  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/stats")
      .then(setS)
      .catch((e) => setError(msg(e)));
  }, []);

  return (
    <section className="ad-page">
      <div className="ad-head">
        <div>
          <h2>نظرة عامة</h2>
          <p>بيانات حقيقية من قاعدة بيانات AnisPhone</p>
        </div>

        <Button
          variant="primary"
          onClick={() => setPage("products")}
        >
          <Plus />
          إضافة منتج
        </Button>
      </div>

      {error && <div className="ad-error">{error}</div>}

      <div className="ad-stats">
        {[
          ["المستخدمون", s?.users, "users", Users],
          ["المنتجات", s?.products, "products", ShoppingBag],
          ["التصنيفات", s?.categories, "categories", Tags],
          [
            "العلامات التجارية",
            s?.brands,
            "brands",
            Building2,
          ],
          [
            "طلبات واتساب",
            s?.whatsapp_orders,
            "orders",
            ClipboardList,
          ],
          [
            "تقييمات بانتظار الموافقة",
            s?.pending_reviews,
            "reviews",
            Star,
          ],
          [
            "رسائل غير مقروءة",
            s?.unread_messages,
            "messages",
            MessageSquare,
          ],
          [
            "طلبات المنتجات",
            s?.product_requests,
            "requests",
            Package,
          ],
        ].map(([l, v, p, I]) => (
          <button
            className="ad-stat"
            key={l}
            onClick={() => setPage(p)}
          >
            <div className="ad-stat-icon">
              <I />
            </div>

            <span>{l}</span>
            <b>{v ?? "—"}</b>
          </button>
        ))}
      </div>

      <div className="ad-grid">
        <section className="ad-card">
          <div className="ad-card-head">
            <h3>إجراءات سريعة</h3>
          </div>

          <div className="ad-quick">
            {[
              ["products", "إدارة المنتجات", ShoppingBag],
              ["categories", "التصنيفات", Tags],
              [
                "brands",
                "العلامات التجارية",
                Building2,
              ],
              ["orders", "الطلبات", ClipboardList],
              ["reviews", "التقييمات", Star],
              ["users", "المستخدمون", Users],
            ].map(([p, l, I]) => (
              <button
                key={p}
                onClick={() => setPage(p)}
              >
                <I />
                <span>{l}</span>
                <ChevronLeft />
              </button>
            ))}
          </div>
        </section>

        <section className="ad-card">
          <div className="ad-card-head">
            <h3>حالة الاتصال</h3>
          </div>

          <div className="ad-health">
            <Badge>قاعدة البيانات متصلة</Badge>

            <p>
              لوحة الإدارة تستخدم API الخلفي مباشرة.
              أي إنشاء أو تعديل أو حذف يتم حفظه في
              PostgreSQL/Neon.
            </p>

            <code>{API}</code>
          </div>
        </section>
      </div>
    </section>
  );
}

function Products() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [p, c, b] = await Promise.all([
        api("/products?admin=true&limit=1000"),
        api("/products/categories?admin=true"),
        api("/products/brands?admin=true"),
      ]);

      setItems(p);
      setCats(c);
      setBrands(b);
    } catch (e) {
      setError(msg(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      items.filter((x) =>
        `${x.name_ar} ${x.name_en} ${x.slug}`
          .toLowerCase()
          .includes(q.toLowerCase())
      ),
    [items, q]
  );

  async function save(data) {
    try {
      const payload = {
        ...data,
        category_id: data.category_id || null,
        brand_id: data.brand_id || null,
        price: data.price === "" || data.price == null ? null : Number(data.price),
        old_price:
          data.old_price === "" || data.old_price == null
            ? null
            : Number(data.old_price),
      };

      if (payload.price == null || Number.isNaN(payload.price)) {
        throw new Error("السعر مطلوب ويجب أن يكون رقماً صحيحاً");
      }

      if (payload.old_price != null && Number.isNaN(payload.old_price)) {
        throw new Error("السعر القديم يجب أن يكون رقماً صحيحاً");
      }

      if (payload.category_id == null || payload.brand_id == null) {
        throw new Error("يجب اختيار التصنيف والعلامة التجارية");
      }

      if (payload.id) {
        await api(`/products/${payload.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setEdit(null);
      await load();
    } catch (e) {
      setError(msg(e));
    }
  }

  async function del(id) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      return;
    }

    try {
      await api(`/products/${id}`, {
        method: "DELETE",
      });

      load();
    } catch (e) {
      setError(msg(e));
    }
  }

  return (
    <section className="ad-page">
      <PageHead
        title="المنتجات"
        text="إدارة المنتجات المخزنة في قاعدة البيانات"
        action={
          <Button
            variant="primary"
            onClick={() => setEdit({})}
          >
            <Plus />
            إضافة منتج
          </Button>
        }
      />

      {error && <div className="ad-error">{error}</div>}

      <div className="ad-toolbar">
        <div className="ad-search">
          <Search />

          <input
            placeholder="ابحث بالاسم أو الرابط..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="ad-table">
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>التصنيف</th>
              <th>العلامة</th>
              <th>السعر</th>
              <th>المخزون</th>
              <th>الحالة</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <b>{p.name_ar}</b>
                  <small>{p.name_en}</small>
                </td>

                <td>{p.category_name_ar}</td>

                <td>{p.brand_name_ar}</td>

                <td>{money(p.price)}</td>

                <td>{p.inventory_quantity ?? 0}</td>

                <td>
                  <Badge ok={p.is_active}>
                    {p.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                </td>

                <td>
                  <div className="ad-actions">
                    <button onClick={() => setEdit(p)}>
                      <Pencil />
                    </button>

                    <button
                      className="danger"
                      onClick={() => del(p.id)}
                    >
                      <Trash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <ProductModal
          item={edit}
          cats={cats}
          brands={brands}
          onSave={save}
          onClose={() => setEdit(null)}
        />
      )}
    </section>
  );
}

function ProductModal({
  item,
  cats,
  brands,
  onSave,
  onClose,
}) {
  const [d, setD] = useState({
    ...item,
  });

  const [productColors, setProductColors] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [images, setImages] = useState([]);
  const [colorForm, setColorForm] = useState({
    name_ar: "",
    name_en: "",
    hex_code: "#000000",
  });
  const [selectedColorId, setSelectedColorId] = useState("");
  const [colorBusy, setColorBusy] = useState(false);
  const [uploadingColorId, setUploadingColorId] = useState("");
  const [loadingProductColors, setLoadingProductColors] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState("");

  function normalizeArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  async function loadProductColors() {
    if (!d.id) return;

    setLoadingProductColors(true);
    try {
      const data = await api(`/products/${d.id}/colors`);
      setProductColors(normalizeArray(data));
    } catch (e) {
      // Some backends return colors as part of the product itself.
      const fallback = normalizeArray(d.colors || d.product_colors);
      setProductColors(fallback);
    } finally {
      setLoadingProductColors(false);
    }
  }

  async function loadAllColors() {
    try {
      const data = await api("/admin/catalog/colors");
      setAllColors(normalizeArray(data));
    } catch (e) {
      setError(msg(e));
    }
  }

  async function loadImages() {
    if (!d.id) return;

    setLoadingImages(true);
    try {
      const data = await api(`/products/${d.id}/images`);
      setImages(normalizeArray(data));
    } catch (e) {
      setError(msg(e));
      setImages([]);
    } finally {
      setLoadingImages(false);
    }
  }

  useEffect(() => {
    if (!d.id) return;
    loadProductColors();
    loadAllColors();
    loadImages();
  }, [d.id]);

  const imageForColor = (colorId) =>
    images.find(
      (image) => String(image.color_id) === String(colorId)
    );

  const colorInProduct = (colorId) =>
    productColors.some(
      (color) => String(color.id) === String(colorId)
    );

  async function createColorAndAttach() {
    const nameAr = colorForm.name_ar.trim();
    const nameEn = colorForm.name_en.trim();
    const hex = colorForm.hex_code.trim();

    if (!nameAr || !nameEn) {
      setError("اكتب اسم اللون بالعربية والإنجليزية");
      return;
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setError("رمز اللون يجب أن يكون بصيغة #RRGGBB");
      return;
    }

    setColorBusy(true);
    setError("");

    try {
      // First find an existing global color by English name.
      let color = allColors.find(
        (x) =>
          String(x.name_en || "").trim().toLowerCase() ===
          nameEn.toLowerCase()
      );

      // Create it only when it doesn't already exist.
      if (!color) {
        color = await api("/admin/catalog/colors", {
          method: "POST",
          body: JSON.stringify({
            name_ar: nameAr,
            name_en: nameEn,
            hex_code: hex,
          }),
        });
      }

      // Attach the global color to this product.
      await api(`/products/${d.id}/colors`, {
        method: "POST",
        body: JSON.stringify({
          color_id: color.id,
        }),
      });

      await Promise.all([
        loadProductColors(),
        loadAllColors(),
      ]);

      setColorForm({
        name_ar: "",
        name_en: "",
        hex_code: "#000000",
      });

      setSelectedColorId(color.id);
    } catch (e) {
      setError(msg(e));
    } finally {
      setColorBusy(false);
    }
  }

  async function attachExistingColor(colorId) {
    if (!colorId || colorInProduct(colorId)) return;

    setColorBusy(true);
    setError("");

    try {
      await api(`/products/${d.id}/colors`, {
        method: "POST",
        body: JSON.stringify({
          color_id: colorId,
        }),
      });

      await loadProductColors();
      setSelectedColorId(colorId);
    } catch (e) {
      setError(msg(e));
    } finally {
      setColorBusy(false);
    }
  }

  async function removeProductColor(colorId) {
    const image = imageForColor(colorId);

    if (image) {
      if (
        !confirm(
          "هذا اللون لديه صورة. حذف اللون سيحذف صورة اللون أيضاً. هل تريد المتابعة؟"
        )
      ) {
        return;
      }

      try {
        await api(`/products/${d.id}/images/${image.id}`, {
          method: "DELETE",
        });
      } catch (e) {
        setError(msg(e));
        return;
      }
    } else if (!confirm("هل تريد إزالة هذا اللون من المنتج؟")) {
      return;
    }

    setColorBusy(true);
    setError("");

    try {
      await api(`/products/${d.id}/colors/${colorId}`, {
        method: "DELETE",
      });

      await Promise.all([
        loadProductColors(),
        loadImages(),
      ]);

      if (String(selectedColorId) === String(colorId)) {
        setSelectedColorId("");
      }
    } catch (e) {
      setError(msg(e));
    } finally {
      setColorBusy(false);
    }
  }

  async function uploadColorImage(colorId, file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة فقط");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("حجم الصورة يجب ألا يتجاوز 10MB");
      return;
    }

    setUploadingColorId(colorId);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("color_id", colorId);

      // The backend uses the color_id to replace the existing
      // image for that product/color, or create it when missing.
      await api(`/products/${d.id}/images`, {
        method: "POST",
        body: formData,
      });

      await loadImages();
    } catch (e) {
      setError(msg(e));
    } finally {
      setUploadingColorId("");
    }
  }

  function updateField(key, value) {
    setD((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  const availableColors = allColors.filter(
    (color) => !colorInProduct(color.id)
  );

  return (
    <Modal
      title={d.id ? "تعديل المنتج" : "إضافة منتج"}
      onClose={onClose}
    >
      <div className="ad-form">
        <Bilingual
          data={d}
          setData={setD}
          prefix="name"
          label="اسم المنتج"
        />

        <Field
          label="الرابط المختصر"
          value={d.slug}
          onChange={(v) => updateField("slug", v)}
          dir="ltr"
        />

        <Bilingual
          data={d}
          setData={setD}
          prefix="description"
          label="الوصف"
        />

        <div className="ad-bi">
          <label className="ad-field">
            <span>التصنيف</span>
            <select
              value={d.category_id || ""}
              onChange={(e) =>
                updateField("category_id", e.target.value)
              }
            >
              <option value="">اختر التصنيف</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar}
                </option>
              ))}
            </select>
          </label>

          <label className="ad-field">
            <span>العلامة التجارية</span>
            <select
              value={d.brand_id || ""}
              onChange={(e) =>
                updateField("brand_id", e.target.value)
              }
            >
              <option value="">اختر العلامة</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name_ar}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="ad-bi">
          <Field
            label="السعر"
            value={d.price}
            onChange={(v) => updateField("price", v)}
            dir="ltr"
          />

          <Field
            label="السعر القديم"
            value={d.old_price}
            onChange={(v) =>
              updateField("old_price", v || null)
            }
            dir="ltr"
          />
        </div>

        <div className="ad-checks">
          {[
            ["is_active", "نشط"],
            ["is_featured", "مميز"],
            ["is_best_seller", "الأكثر مبيعاً"],
            ["is_new_arrival", "وصل حديثاً"],
            ["is_top_deal", "عرض مميز"],
          ].map(([k, l]) => (
            <label key={k}>
              <input
                type="checkbox"
                checked={!!d[k]}
                onChange={(e) =>
                  updateField(k, e.target.checked)
                }
              />
              {l}
            </label>
          ))}
        </div>

        {d.id ? (
          <div className="ad-product-colors">
            <div className="ad-section-title">
              <div>
                <h4>ألوان المنتج</h4>
                <p>أضف ألوان المنتج، ثم أضف صورة واحدة لكل لون.</p>
              </div>
            </div>

            {error && <div className="ad-error">{error}</div>}

            <div className="ad-color-create-box">
              <div className="ad-color-create-head">
                <div>
                  <h5>إضافة لون جديد</h5>
                  <span>سيتم حفظ اللون في الألوان العامة وربطه بهذا المنتج.</span>
                </div>
              </div>

              <div className="ad-color-create-fields">
                <Field
                  label="اسم اللون بالعربية"
                  value={colorForm.name_ar}
                  onChange={(v) =>
                    setColorForm((p) => ({
                      ...p,
                      name_ar: v,
                    }))
                  }
                />

                <Field
                  label="اسم اللون بالإنجليزية"
                  value={colorForm.name_en}
                  onChange={(v) =>
                    setColorForm((p) => ({
                      ...p,
                      name_en: v,
                    }))
                  }
                  dir="ltr"
                />

                <label className="ad-field ad-hex-field">
                  <span>HEX</span>
                  <div className="ad-hex-input">
                    <input
                      className="ad-hex-picker"
                      type="color"
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(colorForm.hex_code)
                          ? colorForm.hex_code
                          : "#000000"
                      }
                      onChange={(e) =>
                        setColorForm((p) => ({
                          ...p,
                          hex_code: e.target.value.toUpperCase(),
                        }))
                      }
                      aria-label="اختيار لون"
                    />
                    <input
                      className="ad-hex-value"
                      value={colorForm.hex_code}
                      onChange={(e) => {
                        let value = e.target.value.trim();
                        if (value && !value.startsWith("#")) {
                          value = `#${value}`;
                        }
                        setColorForm((p) => ({
                          ...p,
                          hex_code: value.toUpperCase(),
                        }));
                      }}
                      dir="ltr"
                      maxLength={7}
                      placeholder="#000000"
                    />
                  </div>
                </label>

                <Button
                  variant="primary"
                  disabled={colorBusy}
                  onClick={createColorAndAttach}
                  className="ad-add-color-button"
                >
                  <Plus />
                  {colorBusy ? "جاري الإضافة..." : "إضافة اللون"}
                </Button>
              </div>
            </div>

            {availableColors.length > 0 && (
              <div className="ad-existing-color-box">
                <label className="ad-field">
                  <span>إضافة لون موجود</span>
                  <select
                    value=""
                    onChange={(e) => attachExistingColor(e.target.value)}
                    disabled={colorBusy}
                  >
                    <option value="">اختر لوناً لإضافته</option>
                    {availableColors.map((color) => (
                      <option key={color.id} value={color.id}>
                        {color.name_ar} — {color.name_en}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}

            {loadingProductColors ? (
              <div className="ad-empty-images">جاري تحميل ألوان المنتج...</div>
            ) : productColors.length === 0 ? (
              <div className="ad-empty-images">
                لم تتم إضافة ألوان لهذا المنتج بعد.
              </div>
            ) : (
              <div className="ad-product-color-list">
                {productColors.map((color) => {
                  const image = imageForColor(color.id);
                  const isUploading =
                    String(uploadingColorId) === String(color.id);

                  return (
                    <div
                      className={`ad-product-color-card ${String(selectedColorId) === String(color.id)
                          ? "selected"
                          : ""
                        }`}
                      key={color.id}
                    >
                      <div className="ad-product-color-info">
                        <span
                          className="ad-color-dot"
                          style={{
                            backgroundColor: color.hex_code || "#ccc",
                          }}
                        />

                        <div className="ad-product-color-name">
                          <strong>{color.name_en}</strong>
                          <small>{color.name_ar}</small>
                          <em>{color.hex_code || "#------"}</em>
                        </div>
                      </div>

                      <div className="ad-product-color-preview">
                        {image ? (
                          <img
                            src={image.image_url}
                            alt={color.name_en}
                          />
                        ) : (
                          <div className="ad-no-color-image">
                            لا توجد صورة
                          </div>
                        )}
                      </div>

                      <div className="ad-product-color-image-controls">
                        <label
                          className={`ad-upload-button ${isUploading ? "uploading" : ""
                            }`}
                          title={
                            image
                              ? "استبدال صورة اللون"
                              : "إضافة صورة اللون"
                          }
                        >
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            disabled={isUploading}
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                uploadColorImage(color.id, file);
                              }
                              e.target.value = "";
                            }}
                          />
                          <Pencil />
                          <span>
                            {isUploading
                              ? "جاري الرفع..."
                              : image
                                ? "استبدال"
                                : "إضافة صورة"}
                          </span>
                        </label>

                        <button
                          type="button"
                          className="ad-color-remove"
                          disabled={colorBusy || isUploading}
                          onClick={() => removeProductColor(color.id)}
                          title="إزالة اللون من المنتج"
                          aria-label="إزالة اللون"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="ad-image-note">
              لكل لون صورة واحدة فقط. رفع صورة جديدة لنفس اللون يستبدل الصورة
              الحالية تلقائياً.
            </div>
          </div>
        ) : (
          <div className="ad-image-note">
            احفظ المنتج أولاً، وبعدها يمكنك إضافة ألوانه وصور كل لون.
          </div>
        )}

        <div className="ad-modal-foot">
          <Button onClick={onClose}>إلغاء</Button>

          <Button
            variant="primary"
            onClick={() =>
              onSave({
                ...d,
                price: Number(d.price),
                old_price: d.old_price
                  ? Number(d.old_price)
                  : null,
                condition: d.condition || "new",
              })
            }
          >
            حفظ
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const configs = {
  categories: {
    title: "التصنيفات",
    resource: "categories",
    fields: [
      ["name_ar", "الاسم بالعربية"],
      ["name_en", "الاسم بالإنجليزية"],
      ["slug", "الرابط المختصر"],
    ],
  },

  brands: {
    title: "العلامات التجارية",
    resource: "brands",
    fields: [
      ["name_ar", "الاسم بالعربية"],
      ["name_en", "الاسم بالإنجليزية"],
      ["slug", "الرابط المختصر"],
    ],
  },

  colors: {
    title: "الألوان",
    resource: "colors",
    fields: [
      ["name_ar", "الاسم بالعربية"],
      ["name_en", "الاسم بالإنجليزية"],
      ["hex_code", "رمز اللون"],
    ],
  },

  branches: {
    title: "الفروع",
    resource: "branches",
    fields: [
      ["name_ar", "اسم الفرع بالعربية"],
      ["name_en", "اسم الفرع بالإنجليزية"],
      ["address_ar", "العنوان بالعربية"],
      ["address_en", "العنوان بالإنجليزية"],
      ["phone", "الهاتف"],
      ["map_url", "رابط الخريطة"],
    ],
  },
};

function CrudPage({ type }) {
  const c = configs[type];

  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setItems(
        await api(`/admin/catalog/${c.resource}`)
      );
    } catch (e) {
      setError(msg(e));
    }
  }

  useEffect(() => {
    load();
  }, [type]);

  const rows = items.filter((x) =>
    JSON.stringify(x)
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  async function save(d) {
    try {
      if (d.id) {
        await api(
          `/admin/catalog/${c.resource}/${d.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(d),
          }
        );
      } else {
        await api(`/admin/catalog/${c.resource}`, {
          method: "POST",
          body: JSON.stringify(d),
        });
      }

      setEdit(null);
      load();
    } catch (e) {
      setError(msg(e));
    }
  }

  async function del(id) {
    if (!confirm("هل أنت متأكد من الحذف؟")) {
      return;
    }

    try {
      await api(
        `/admin/catalog/${c.resource}/${id}`,
        {
          method: "DELETE",
        }
      );

      load();
    } catch (e) {
      setError(msg(e));
    }
  }

  return (
    <section className="ad-page">
      <PageHead
        title={c.title}
        text="إدارة مباشرة لبيانات قاعدة البيانات"
        action={
          <Button
            variant="primary"
            onClick={() => setEdit({})}
          >
            <Plus />
            إضافة
          </Button>
        }
      />

      {error && <div className="ad-error">{error}</div>}

      <div className="ad-toolbar">
        <div className="ad-search">
          <Search />

          <input
            placeholder="بحث..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="ad-card ad-list">
        {rows.map((x) => (
          <div className="ad-list-row" key={x.id}>
            <div>
              <b>
                {x.name_ar ||
                  x.name_en ||
                  x.hex_code}
              </b>

              <small>
                {x.name_en ||
                  x.slug ||
                  x.phone ||
                  ""}
              </small>
            </div>

            <Badge ok={x.is_active !== false}>
              {x.is_active === false
                ? "غير نشط"
                : "نشط"}
            </Badge>

            <div className="ad-actions">
              <button onClick={() => setEdit(x)}>
                <Pencil />
              </button>

              <button
                className="danger"
                onClick={() => del(x.id)}
              >
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <GenericModal
          config={c}
          item={edit}
          onSave={save}
          onClose={() => setEdit(null)}
        />
      )}
    </section>
  );
}

function GenericModal({
  config,
  item,
  onSave,
  onClose,
}) {
  const [d, setD] = useState({
    ...item,
  });

  return (
    <Modal
      title={d.id ? "تعديل" : "إضافة"}
      onClose={onClose}
    >
      <div className="ad-form">
        {config.fields.map(([k, l]) => (
          <Field
            key={k}
            label={l}
            value={d[k]}
            onChange={(v) =>
              setD({
                ...d,
                [k]: v,
              })
            }
            textarea={
              k.includes("description") ||
              k.includes("address")
            }
          />
        ))}

        {["categories", "brands", "branches"].includes(
          config.resource
        ) && (
            <label className="ad-check">
              <input
                type="checkbox"
                checked={d.is_active !== false}
                onChange={(e) =>
                  setD({
                    ...d,
                    is_active: e.target.checked,
                  })
                }
              />

              نشط
            </label>
          )}

        <div className="ad-modal-foot">
          <Button onClick={onClose}>إلغاء</Button>

          <Button
            variant="primary"
            onClick={() => onSave(d)}
          >
            حفظ
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Inventory() {
  const [p, setP] = useState([]);
  const [edit, setEdit] = useState(null);

  async function load() {
    setP(await api("/products?admin=true&limit=1000"));
  }

  useEffect(() => {
    load().catch(() => { });
  }, []);

  async function save() {
    try {
      await api(
        `/products/${edit.id}/inventory`,
        {
          method: "PUT",
          body: JSON.stringify({
            quantity: Number(edit.quantity),
            is_available: edit.is_available,
          }),
        }
      );

      setEdit(null);
      load();
    } catch (e) {
      alert(msg(e));
    }
  }

  return (
    <section className="ad-page">
      <PageHead
        title="المخزون"
        text="تحديث الكمية والتوفر مباشرة"
      />

      <div className="ad-table">
        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>SKU / الرابط</th>
              <th>الكمية</th>
              <th>التوفر</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {p.map((x) => (
              <tr key={x.id}>
                <td>
                  <b>{x.name_ar}</b>
                </td>

                <td>{x.slug}</td>

                <td>
                  {x.inventory_quantity ?? 0}
                </td>

                <td>
                  <Badge ok={x.inventory_available}>
                    {x.inventory_available
                      ? "متوفر"
                      : "غير متوفر"}
                  </Badge>
                </td>

                <td>
                  <Button
                    onClick={() =>
                      setEdit({
                        id: x.id,
                        name: x.name_ar,
                        quantity:
                          x.inventory_quantity || 0,
                        is_available:
                          x.inventory_available,
                      })
                    }
                  >
                    <Pencil />
                    تعديل
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <Modal
          title={`مخزون: ${edit.name}`}
          onClose={() => setEdit(null)}
        >
          <div className="ad-form">
            <Field
              label="الكمية"
              value={edit.quantity}
              onChange={(v) =>
                setEdit({
                  ...edit,
                  quantity: v,
                })
              }
              dir="ltr"
            />

            <label className="ad-check">
              <input
                type="checkbox"
                checked={!!edit.is_available}
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    is_available:
                      e.target.checked,
                  })
                }
              />

              متوفر
            </label>

            <div className="ad-modal-foot">
              <Button
                onClick={() => setEdit(null)}
              >
                إلغاء
              </Button>

              <Button
                variant="primary"
                onClick={save}
              >
                حفظ
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

function Orders() {
  const [x, setX] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/orders/admin")
      .then(setX)
      .catch((e) => setError(msg(e)));
  }, []);

  return (
    <section className="ad-page">
      <PageHead
        title="الطلبات"
        text="الطلبات المسجلة عبر واتساب"
      />

      {error && <div className="ad-error">{error}</div>}     <div className="ad-table">
        <table>
          <thead>
            <tr>
              <th>العميل</th>
              <th>الهاتف</th>
              <th>الرسالة</th>
              <th>التاريخ</th>
            </tr>
          </thead>

          <tbody>
            {x.map((o) => (
              <tr key={o.id}>
                <td>{o.user_name}</td>

                <td dir="ltr">{o.phone}</td>

                <td className="wrap">
                  {o.message}
                </td>

                <td>
                  {new Date(
                    o.created_at
                  ).toLocaleString("ar")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Customers() {
  const [x, setX] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/users")
      .then(setX)
      .catch((e) => setError(msg(e)));
  }, []);

  async function toggle(u) {
    try {
      const next = !u.is_active;
      await api(`/admin/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          is_active: next,
        }),
      });

      setX((current) =>
        current.map((a) =>
          a.id === u.id ? { ...a, is_active: next } : a
        )
      );
    } catch (e) {
      setError(msg(e));
    }
  }

  return (
    <section className="ad-page">
      <PageHead
        title="العملاء"
        text="المستخدمون المسجلون في المتجر"
      />

      {error && <div className="ad-error">{error}</div>}     <div className="ad-table">
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>الدور</th>
              <th>الحالة</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {x.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>

                <td dir="ltr">{u.phone}</td>

                <td>
                  {u.role === "admin"
                    ? "مدير"
                    : "عميل"}
                </td>

                <td>
                  <Badge ok={u.is_active}>
                    {u.is_active
                      ? "نشط"
                      : "غير نشط"}
                  </Badge>
                </td>

                <td>
                  <Button
                    onClick={() => toggle(u)}
                  >
                    {u.is_active
                      ? "تعطيل"
                      : "تفعيل"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setReviews(await api("/reviews/admin/all"));
    } catch (e) {
      setError(msg(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(review, approved) {
    try {
      await api(`/reviews/admin/${review.id}/approve`, {
        method: "PATCH",
        body: JSON.stringify({
          is_approved: approved,
        }),
      });

      await load();
    } catch (e) {
      setError(msg(e));
    }
  }

  return (
    <section className="ad-page">
      <PageHead
        title="التقييمات"
        text="مراجعة واعتماد تقييمات العملاء"
      />

      {error && <div className="ad-error">{error}</div>}

      <div className="ad-card ad-reviews">
        {reviews.map((review) => (
          <div className="ad-review" key={review.id}>
            <div className="ad-avatar">
              {review.user_name?.[0] || "؟"}
            </div>

            <div className="grow">
              <b>{review.user_name || "عميل"}</b>

              <div className="stars">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>

              <p>{review.comment_ar || review.comment_en || ""}</p>
            </div>

            <div>
              {review.is_approved ? (
                <Button onClick={() => approve(review, false)}>
                  إخفاء
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => approve(review, true)}
                >
                  موافقة
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContentPage({
  type,
  title,
}) {
  const cfg = {
    banners: {
      fields: ["image_url"],
      labels: ["صورة البنر"],
    },

    faqs: {
      fields: [
        "question_ar",
        "question_en",
        "answer_ar",
        "answer_en",
        "sort_order",
      ],
      labels: [
        "السؤال بالعربية",
        "السؤال بالإنجليزية",
        "الإجابة بالعربية",
        "الإجابة بالإنجليزية",
        "ترتيب العرض",
      ],
    },

    "homepage-sections": {
      fields: [
        "name_ar",
        "name_en",
        "section_type",
        "sort_order",
      ],
      labels: [
        "اسم القسم بالعربية",
        "اسم القسم بالإنجليزية",
        "نوع القسم",
        "ترتيب العرض",
      ],
    },
  }[type];

  const [items, setItems] = useState([]);
  const [edit, setEdit] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      setItems(
        await api(`/content/${type}?all=true`)
      );
    } catch (e) {
      setError(msg(e));
    }
  }

  useEffect(() => {
    load();
  }, [type]);

  async function uploadBanner(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة فقط");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("حجم الصورة يجب ألا يتجاوز 10MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      /*
       * IMPORTANT:
       * This endpoint must return the Cloudinary URL.
       * Change the endpoint only if your backend uses
       * a different upload route.
       */
      const result = await api("/content/banners/upload", {
        method: "POST",
        body: formData,
      });

      const imageUrl =
        result?.image_url ||
        result?.url ||
        result?.secure_url;

      if (!imageUrl) {
        throw new Error(
          "لم يتم استلام رابط الصورة من Cloudinary"
        );
      }

      setEdit((prev) => ({
        ...(prev || {}),
        image_url: imageUrl,
      }));
    } catch (e) {
      setError(msg(e));
    } finally {
      setUploading(false);
    }
  }

  async function save(d) {
    try {
      if (type === "banners" && !d.image_url) {
        throw new Error("يجب رفع صورة البنر");
      }

      if (d.id) {
        await api(
          `/content/${type}/${d.id}`,
          {
            method: "PATCH",
            body: JSON.stringify(d),
          }
        );
      } else {
        await api(
          `/content/${type}`,
          {
            method: "POST",
            body: JSON.stringify(d),
          }
        );
      }

      setEdit(null);
      await load();
    } catch (e) {
      setError(msg(e));
    }
  }

  async function del(id) {
    if (!confirm("هل أنت متأكد من الحذف؟")) {
      return;
    }

    try {
      await api(
        `/content/${type}/${id}`,
        {
          method: "DELETE",
        }
      );

      await load();
    } catch (e) {
      setError(msg(e));
    }
  }

  return (
    <section className="ad-page">
      <PageHead
        title={title}
        text={
          type === "banners"
            ? "إدارة صور البنرات المعروضة في الصفحة الرئيسية"
            : "إدارة المحتوى المخزن في قاعدة البيانات"
        }
        action={
          <Button
            variant="primary"
            onClick={() => {
              setError("");
              setEdit({});
            }}
          >
            <Plus />
            إضافة
          </Button>
        }
      />

      {error && (
        <div className="ad-error">
          {error}
        </div>
      )}

      <div className="ad-card ad-list">
        {items.length === 0 ? (
          <div className="ad-empty">
            لا توجد بيانات.
          </div>
        ) : (
          items.map((x) => (
            <div
              className="ad-list-row"
              key={x.id}
            >
              {type === "banners" ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "140px",
                      height: "70px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "#f5f1ee",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={x.image_url}
                      alt="Banner"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <b>بنر</b>

                    <small
                      dir="ltr"
                      style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {x.image_url}
                    </small>
                  </div>
                </div>
              ) : (
                <div>
                  <b>
                    {x.title_ar ||
                      x.question_ar ||
                      x.name_ar}
                  </b>

                  <small>
                    {x.title_en ||
                      x.question_en ||
                      x.name_en}
                  </small>
                </div>
              )}

              <Badge
                ok={x.is_active !== false}
              >
                {x.is_active === false
                  ? "غير نشط"
                  : "نشط"}
              </Badge>

              <div className="ad-actions">
                <button
                  onClick={() => {
                    setError("");
                    setEdit(x);
                  }}
                >
                  <Pencil />
                </button>

                <button
                  className="danger"
                  onClick={() => del(x.id)}
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {edit && (
        <Modal
          title={
            edit.id
              ? "تعديل البنر"
              : "إضافة بنر"
          }
          onClose={() => {
            if (!uploading) {
              setEdit(null);
            }
          }}
        >
          <div className="ad-form">

            {type === "banners" ? (
              <>
                <div className="banner-image-upload">
                  <label className="banner-image-upload-label">
                    صورة البنر
                  </label>

                  <div className="banner-image-upload-box">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          uploadBanner(file);
                        }

                        e.target.value = "";
                      }}
                    />

                    {!edit.image_url ? (
                      <div className="banner-upload-placeholder">
                        <div className="banner-upload-icon">
                          <Plus size={24} />
                        </div>

                        <div className="banner-upload-title">
                          إضافة صورة
                        </div>

                        <div className="banner-upload-subtitle">
                          PNG, JPG أو WEBP — بحد أقصى 10MB
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="banner-image-preview">
                          <img
                            src={edit.image_url}
                            alt="Banner preview"
                          />
                        </div>

                        {!uploading && (
                          <div className="banner-image-replace">
                            تغيير الصورة
                          </div>
                        )}
                      </>
                    )}

                    {uploading && (
                      <div className="banner-upload-placeholder">
                        <div className="banner-upload-icon">
                          <RefreshCw size={22} className="spin" />
                        </div>

                        <div className="banner-upload-title">
                          جاري رفع الصورة...
                        </div>

                        <div className="banner-upload-subtitle">
                          يرجى الانتظار
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Field
                  label="ترتيب العرض"
                  value={edit.sort_order ?? 0}
                  onChange={(v) =>
                    setEdit({
                      ...edit,
                      sort_order: v === "" ? 0 : Number(v),
                    })
                  }
                  dir="ltr"
                />
              </>
            ) : (
              cfg.fields.map((k, i) => (
                <Field
                  key={k}
                  label={cfg.labels[i]}
                  value={edit[k]}
                  onChange={(v) =>
                    setEdit({
                      ...edit,
                      [k]: v,
                    })
                  }
                  textarea={
                    k.includes("description") ||
                    k.includes("answer")
                  }
                />
              ))
            )}

            <label className="ad-check">
              <input
                type="checkbox"
                checked={
                  edit.is_active !== false
                }
                onChange={(e) =>
                  setEdit({
                    ...edit,
                    is_active:
                      e.target.checked,
                  })
                }
              />

              نشط
            </label>

            <div className="ad-modal-foot">
              <Button
                onClick={() => setEdit(null)}
                disabled={uploading}
              >
                إلغاء
              </Button>

              <Button
                variant="primary"
                disabled={
                  uploading ||
                  (type === "banners" &&
                    !edit.image_url)
                }
                onClick={() => save(edit)}
              >
                حفظ
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}


function ContactMessages() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      setItems(await api("/admin/contact-messages"));
    } catch (e) {
      setError(msg(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(item, value) {
    try {
      await api(`/admin/contact-messages/${item.id}/read`, {
        method: "PATCH",
        body: JSON.stringify({ is_read: value }),
      });
      await load();
    } catch (e) {
      setError(msg(e));
    }
  }

  return (
    <section className="ad-page">
      <PageHead title="رسائل التواصل" text="رسائل العملاء المرسلة من المتجر" />
      {error && <div className="ad-error">{error}</div>}
      <div className="ad-card ad-list">
        {items.length === 0 ? (
          <div className="ad-empty">لا توجد رسائل.</div>
        ) : items.map((x) => (
          <div className="ad-list-row" key={x.id}>
            <div>
              <b>{x.name || "بدون اسم"}</b>
              <small dir="ltr">{x.phone || ""}</small>
              <p className="ad-row-message">{x.message}</p>
            </div>
            <Badge ok={!x.is_read}>{x.is_read ? "مقروءة" : "جديدة"}</Badge>
            <Button onClick={() => markRead(x, !x.is_read)}>
              {x.is_read ? "تحديد كغير مقروءة" : "تحديد كمقروءة"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProductRequests() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/admin/product-requests")
      .then(setItems)
      .catch((e) => setError(msg(e)));
  }, []);

  return (
    <section className="ad-page">
      <PageHead title="طلبات المنتجات" text="طلبات العملاء لإضافة منتجات غير موجودة" />
      {error && <div className="ad-error">{error}</div>}
      <div className="ad-card ad-list">
        {items.length === 0 ? (
          <div className="ad-empty">لا توجد طلبات.</div>
        ) : items.map((x) => (
          <div className="ad-list-row" key={x.id}>
            <div>
              <b>{x.product_name_ar || x.product_name_en || "طلب منتج"}</b>
              <small>{x.product_name_en || x.user_name || ""}</small>
              {x.message && <p className="ad-row-message">{x.message}</p>}
            </div>
            <div>
              <b>{x.user_name || "—"}</b>
              <small dir="ltr">{x.phone || ""}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingsPage({ user }) {
  return (
    <section className="ad-page">
      <PageHead
        title="الإعدادات"
        text="حساب المدير واتصال الواجهة بالـ API"
      />

      <div className="ad-card ad-settings">
        <h3>الحساب الحالي</h3>

        <div className="ad-form">
          <Field
            label="الاسم"
            value={user?.name || ""}
            onChange={() => { }}
          />

          <Field
            label="رقم الهاتف"
            value={user?.phone || ""}
            onChange={() => { }}
            dir="ltr"
          />
        </div>

        <div className="ad-health">
          <Badge>API</Badge>
          <code>{API}</code>
        </div>
      </div>
    </section>
  );
}

function PageHead({
  title,
  text,
  action,
}) {
  return (
    <div className="ad-head">
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>

      {action}
    </div>
  );
}

export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);

    if (t) {
      api("/auth/me")
        .then((u) => {
          if (u.role === "admin") {
            setUser(u);
          } else {
            localStorage.removeItem(TOKEN_KEY);
          }
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY);
        });
    }
  }, []);

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  let content;

  if (page === "dashboard") {
    content = <Dashboard setPage={setPage} />;
  } else if (page === "products") {
    content = <Products />;
  } else if (page === "inventory") {
    content = <Inventory />;
  } else if (page === "orders") {
    content = <Orders />;
  } else if (page === "customers" || page === "users") {
    content = <Customers />;
  } else if (page === "reviews") {
    content = <Reviews />;
  } else if (page === "messages") {
    content = <ContactMessages />;
  } else if (page === "requests") {
    content = <ProductRequests />;
  } else if (page === "settings") {
    content = <SettingsPage user={user} />;
  } else if (page === "banners") {
    content = (
      <ContentPage
        type="banners"
        title="البنرات"
      />
    );
  } else if (page === "faqs") {
    content = (
      <ContentPage
        type="faqs"
        title="الأسئلة الشائعة"
      />
    );
  }
  else {
    content = <CrudPage type={page} />;
  }

  return (
    <Shell
      page={page}
      setPage={setPage}
      user={user}
      onLogout={logout}
    >
      {content}
    </Shell>
  );
}