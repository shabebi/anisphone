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

function normalizeSpecifications(specifications) {
  if (!Array.isArray(specifications)) return [];

  return specifications
    .map((spec, index) => ({
      id: spec?.id || null,
      section_ar: spec?.section_ar ?? "",
      section_en: spec?.section_en ?? "",
      name_ar: spec?.name_ar ?? "",
      name_en: spec?.name_en ?? "",
      value_ar: spec?.value_ar ?? "",
      value_en: spec?.value_en ?? "",
      sort_order:
        spec?.sort_order == null || spec?.sort_order === ""
          ? index
          : Number(spec.sort_order),
    }))
    .sort(
      (a, b) =>
        Number(a.sort_order || 0) - Number(b.sort_order || 0)
    );
}

async function saveProductSpecifications(productId, specifications) {
  const clean = normalizeSpecifications(specifications).map(
    (spec, index) => ({
      ...(spec.id ? { id: spec.id } : {}),
      section_ar: String(spec.section_ar || "").trim(),
      section_en: String(spec.section_en || "").trim(),
      name_ar: String(spec.name_ar || "").trim(),
      name_en: String(spec.name_en || "").trim(),
      value_ar: String(spec.value_ar || "").trim(),
      value_en: String(spec.value_en || "").trim(),
      sort_order: index,
    })
  );

  return api(`/products/${productId}/specifications`, {
    method: "PUT",
    body: JSON.stringify({
      specifications: clean,
    }),
  });
}

const nav = [
  ["dashboard", "لوحة التحكم", Home],
  ["products", "المنتجات", ShoppingBag],
  ["categories", "التصنيفات", Tags],
  ["brands", "العلامات التجارية", Building2],
  ["colors", "الألوان", Palette],
  ["inventory", "المخزون", Boxes],
  ["orders", "الطلبات", ClipboardList],
  ["trade-ins", "طلبات الاستبدال", ClipboardList],
  ["trade-in-settings", "إعدادات الاستبدال", Settings],
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
        price:
          data.price === "" || data.price == null
            ? null
            : Number(data.price),
        old_price:
          data.old_price === "" || data.old_price == null
            ? null
            : Number(data.old_price),
      };

      if (payload.price == null || Number.isNaN(payload.price)) {
        throw new Error("السعر مطلوب ويجب أن يكون رقماً صحيحاً");
      }

      if (
        payload.old_price != null &&
        Number.isNaN(payload.old_price)
      ) {
        throw new Error("السعر القديم يجب أن يكون رقماً صحيحاً");
      }

      if (
        payload.category_id == null ||
        payload.brand_id == null
      ) {
        throw new Error("يجب اختيار التصنيف والعلامة التجارية");
      }

      const specifications = Array.isArray(payload.specifications)
        ? payload.specifications
        : [];

      delete payload.specifications;

      let savedProduct;

      if (payload.id) {
        savedProduct = await api(`/products/${payload.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        savedProduct = await api("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      if (savedProduct?.id) {
        await saveProductSpecifications(
          savedProduct.id,
          specifications
        );
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [specifications, setSpecifications] = useState(
    normalizeSpecifications(item?.specifications)
  );

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

  function addSpecification() {
    setSpecifications((prev) => [
      ...prev,
      {
        id: null,
        section_ar: "",
        section_en: "",
        name_ar: "",
        name_en: "",
        value_ar: "",
        value_en: "",
        sort_order: prev.length,
      },
    ]);
  }

  function updateSpecification(index, key, value) {
    setSpecifications((prev) =>
      prev.map((spec, i) =>
        i === index
          ? {
              ...spec,
              [key]: value,
            }
          : spec
      )
    );
  }

  function removeSpecification(index) {
    setSpecifications((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((spec, i) => ({
          ...spec,
          sort_order: i,
        }))
    );
  }

  const availableColors = allColors.filter(
    (color) => !colorInProduct(color.id)
  );

  return (
    <>
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

        <div className="ad-description-section">
          <div className="ad-description-head">
            <div>
              <strong>تفاصيل المنتج</strong>
              <span>أضف جميع مواصفات وتفاصيل المنتج بالعربية والإنجليزية</span>
            </div>

            <button
              type="button"
              className="ad-details-open-button"
              onClick={() => setDetailsOpen(true)}
            >
              <FileText />
              فتح محرر التفاصيل
            </button>
          </div>

          <div className="ad-description-preview">
            <div className="ad-description-preview-box">
              <span>العربية</span>
              <p dir="rtl">
                {d.description_ar
                  ? d.description_ar
                  : "لم تتم إضافة تفاصيل عربية بعد"}
              </p>
            </div>

            <div className="ad-description-preview-box">
              <span>English</span>
              <p dir="ltr">
                {d.description_en
                  ? d.description_en
                  : "No English details added yet"}
              </p>
            </div>
          </div>
        </div>

        <ProductSpecificationsEditor
          specifications={specifications}
          onAdd={addSpecification}
          onChange={updateSpecification}
          onRemove={removeSpecification}
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
                specifications,
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

      {detailsOpen && (
        <DescriptionEditor
          data={d}
          setData={setD}
          onClose={() => setDetailsOpen(false)}
        />
      )}
    </>
  );
}

function ProductSpecificationsEditor({
  specifications,
  onAdd,
  onChange,
  onRemove,
}) {
  const rows = Array.isArray(specifications)
    ? specifications
    : [];

  return (
    <section
      style={{
        marginTop: "18px",
        padding: "18px",
        border: "1px solid #eadfd8",
        borderRadius: "16px",
        background: "#fff",
      }}
      dir="rtl"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "8px",
        }}
      >
        <div>
          <strong
            style={{
              display: "block",
              fontSize: "17px",
              color: "#412d2f",
            }}
          >
            المواصفات
          </strong>
          <span
            style={{
              display: "block",
              marginTop: "4px",
              color: "#806f65",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            هذه هي المواصفات التي تظهر في جداول "المواصفات" داخل صفحة المنتج.
            يمكنك تعديل الموجودة، حذفها، أو إضافة مواصفات جديدة.
          </span>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="ad-btn primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            whiteSpace: "nowrap",
          }}
        >
          <Plus size={16} />
          إضافة مواصفة
        </button>
      </div>

      {rows.length === 0 ? (
        <div
          style={{
            padding: "24px 16px",
            border: "1px dashed #dbcfc8",
            borderRadius: "12px",
            textAlign: "center",
            color: "#8b7b72",
            background: "#faf7f5",
          }}
        >
          لا توجد مواصفات لهذا المنتج بعد.
          <div style={{ marginTop: "6px", fontSize: "13px" }}>
            اضغط "إضافة مواصفة" لإنشاء أول صف.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "12px",
            marginTop: "14px",
          }}
        >
          {rows.map((spec, index) => (
            <div
              key={spec.id || `new-spec-${index}`}
              style={{
                border: "1px solid #eadfd8",
                borderRadius: "14px",
                padding: "14px",
                background: "#fcfaf9",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f0e7e1",
                      color: "#5f4227",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    {index + 1}
                  </span>

                  <strong
                    style={{
                      color: "#412d2f",
                      fontSize: "14px",
                    }}
                  >
                    مواصفة {index + 1}
                  </strong>
                </div>

                <button
                  type="button"
                  className="danger"
                  onClick={() => onRemove(index)}
                  title="حذف المواصفة"
                  aria-label="حذف المواصفة"
                  style={{
                    border: "1px solid #ead1d1",
                    background: "#fff",
                    borderRadius: "9px",
                    padding: "7px",
                    color: "#a33",
                    cursor: "pointer",
                    display: "inline-flex",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "10px",
                }}
              >
                <Field
                  label="القسم بالعربية"
                  value={spec.section_ar}
                  onChange={(v) =>
                    onChange(index, "section_ar", v)
                  }
                  dir="rtl"
                  required
                />

                <Field
                  label="القسم بالإنجليزية"
                  value={spec.section_en}
                  onChange={(v) =>
                    onChange(index, "section_en", v)
                  }
                  dir="ltr"
                  required
                />

                <Field
                  label="اسم المواصفة بالعربية"
                  value={spec.name_ar}
                  onChange={(v) =>
                    onChange(index, "name_ar", v)
                  }
                  dir="rtl"
                  required
                />

                <Field
                  label="اسم المواصفة بالإنجليزية"
                  value={spec.name_en}
                  onChange={(v) =>
                    onChange(index, "name_en", v)
                  }
                  dir="ltr"
                  required
                />

                <Field
                  label="القيمة بالعربية"
                  value={spec.value_ar}
                  onChange={(v) =>
                    onChange(index, "value_ar", v)
                  }
                  dir="rtl"
                  textarea
                  required
                />

                <Field
                  label="القيمة بالإنجليزية"
                  value={spec.value_en}
                  onChange={(v) =>
                    onChange(index, "value_en", v)
                  }
                  dir="ltr"
                  textarea
                  required
                />

                <Field
                  label="ترتيب العرض"
                  value={spec.sort_order ?? index}
                  onChange={(v) =>
                    onChange(
                      index,
                      "sort_order",
                      v === "" ? index : Number(v)
                    )
                  }
                  dir="ltr"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function DescriptionEditor({ data, setData, onClose }) {
  const [draft, setDraft] = useState({
    description_ar: data.description_ar || "",
    description_en: data.description_en || "",
  });

  function update(key, value) {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function save() {
    setData((prev) => ({
      ...prev,
      description_ar: draft.description_ar,
      description_en: draft.description_en,
    }));
    onClose();
  }

  return (
    <div className="ad-details-editor-wrap">
      <div className="ad-details-editor">
        <div className="ad-details-editor-head">
          <div>
            <span>تفاصيل المنتج</span>
            <h3>محرر تفاصيل المنتج</h3>
            <p>أضف أو عدّل جميع تفاصيل المنتج بسهولة. يمكنك استخدام أسطر متعددة وتقسيم المواصفات كما تريد.</p>
          </div>

          <button
            type="button"
            className="ad-details-editor-close"
            onClick={onClose}
          >
            <X />
          </button>
        </div>

        <div className="ad-details-editor-body">
          <div className="ad-details-editor-language">
            <div className="ad-details-editor-language-head">
              <div>
                <strong>الوصف بالعربية</strong>
                <small>تفاصيل المنتج التي ستظهر للمستخدم العربي</small>
              </div>

              <button
                type="button"
                onClick={() => update("description_ar", "")}
                className="ad-details-clear"
              >
                مسح
              </button>
            </div>

            <textarea
              value={draft.description_ar}
              onChange={(e) => update("description_ar", e.target.value)}
              dir="rtl"
              placeholder={`اكتب تفاصيل المنتج بالعربية هنا...\n\nمثال:\n\nالتصميم والألوان:\nإطار من التيتانيوم مع تصميم أنيق...\n\nالشاشة:\nشاشة Dynamic AMOLED 2X بحجم 6.8 بوصة...\n\nالأداء:\nمعالج Snapdragon 8 Gen 3...\n\nالكاميرات:\nكاميرا رئيسية بدقة 200MP...\n\nالبطارية:\nبطارية بسعة 5000mAh...`}
            />

            <div className="ad-details-counter">
              {draft.description_ar.length.toLocaleString("ar")} حرف
            </div>
          </div>

          <div className="ad-details-editor-language">
            <div className="ad-details-editor-language-head">
              <div>
                <strong>الوصف بالإنجليزية</strong>
                <small>تفاصيل المنتج التي ستظهر للمستخدم الإنجليزي</small>
              </div>

              <button
                type="button"
                onClick={() => update("description_en", "")}
                className="ad-details-clear"
              >
                Clear
              </button>
            </div>

            <textarea
              value={draft.description_en}
              onChange={(e) => update("description_en", e.target.value)}
              dir="ltr"
              placeholder={`Write the product details here...\n\nExample:\n\nDesign and colors:\nA reinforced titanium frame with balanced weight...\n\nDisplay:\n6.8-inch Dynamic AMOLED 2X display...\n\nPerformance:\nSnapdragon 8 Gen 3 for Galaxy processor...\n\nCameras:\n200MP main camera...\n\nBattery:\n5000mAh battery...`}
            />

            <div className="ad-details-counter" dir="ltr">
              {draft.description_en.length.toLocaleString("en-US")} characters
            </div>
          </div>
        </div>

        <div className="ad-details-editor-foot">
          <Button onClick={onClose}>إلغاء</Button>
          <Button variant="primary" onClick={save}>
            <FileText />
            حفظ التفاصيل
          </Button>
        </div>
      </div>
    </div>
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
      ["display_order", "ترتيب العرض"],
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
          <div className={`ad-list-row ${type === "categories" ? "category-admin-row" : ""}`} key={x.id}>
            {type === "categories" && (
              <div className="category-admin-thumb">
                {x.image ? (
                  <img src={x.image} alt={x.name_en || x.name_ar || ""} />
                ) : (
                  <span>—</span>
                )}
              </div>
            )}

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
    display_order:
      item?.display_order == null ? 0 : item.display_order,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  async function uploadCategoryImage(file) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("يرجى اختيار ملف صورة فقط");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError("حجم الصورة يجب ألا يتجاوز 10MB");
      return;
    }

    setUploadingImage(true);
    setImageError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await api("/admin/catalog/categories/upload", {
        method: "POST",
        body: formData,
      });

      const imageUrl =
        result?.image_url ||
        result?.url ||
        result?.secure_url;

      if (!imageUrl) {
        throw new Error("لم يتم استلام رابط الصورة من Cloudinary");
      }

      setD((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    } catch (e) {
      setImageError(msg(e));
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <Modal
      title={d.id ? "تعديل التصنيف" : "إضافة تصنيف"}
      onClose={onClose}
    >
      <div className="ad-form">
        {config.resource === "categories" && (
          <div className="category-image-admin-field">
            <div className="category-image-admin-head">
              <div>
                <strong>صورة التصنيف</strong>
                <small>ترفع مباشرة إلى Cloudinary</small>
              </div>
              {d.image && (
                <button
                  type="button"
                  className="category-image-admin-remove"
                  onClick={() => setD((prev) => ({ ...prev, image: "" }))}
                >
                  إزالة الصورة
                </button>
              )}
            </div>

            <label className="category-image-admin-upload">
              {d.image ? (
                <img src={d.image} alt="" />
              ) : (
                <div className="category-image-admin-placeholder">
                  <span>+</span>
                  <b>اختر صورة التصنيف</b>
                  <small>PNG / JPG / WEBP — حتى 10MB</small>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadCategoryImage(e.target.files?.[0])}
                disabled={uploadingImage}
              />
            </label>

            {uploadingImage && (
              <div className="category-image-admin-status">
                جاري رفع الصورة إلى Cloudinary...
              </div>
            )}

            {imageError && (
              <div className="ad-error">{imageError}</div>
            )}
          </div>
        )}

        {config.fields.map(([k, l]) => (
          <Field
            key={k}
            label={l}
            value={d[k]}
            onChange={(v) =>
              setD({
                ...d,
                [k]:
                  k === "display_order"
                    ? v.replace(/\D/g, "")
                    : v,
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
            disabled={config.resource === "categories" && uploadingImage}
            onClick={() =>
              onSave({
                ...d,
                ...(config.resource === "categories"
                  ? {
                      display_order:
                        Number(d.display_order || 0),
                    }
                  : {}),
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

function TradeIns() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const statuses = [
    ["pending", "قيد المراجعة"],
    ["contacted", "تم التواصل"],
    ["accepted", "تم قبول الطلب"],
    ["rejected", "تم رفض الطلب"],
    ["completed", "مكتمل"],
  ];

  const statusLabel = (status) =>
    statuses.find(([value]) => value === status)?.[1] || status || "—";

  async function load() {
    try {
      setLoading(true);
      setError("");

      const data = await api("/admin/trade-ins");
      setItems(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setError(msg(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateItem(id, patch) {
    try {
      setSavingId(id);

      const updated = await api(`/admin/trade-ins/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });

      setItems((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, ...(updated || patch) } : item
        )
      );
    } catch (e) {
      setError(msg(e));
    } finally {
      setSavingId(null);
    }
  }

  const yesNo = (value) => {
    if (value === true) return "نعم";
    if (value === false) return "لا";
    return "—";
  };

  const conditionClass = (value) => {
    if (value === true) return "trade-condition yes";
    if (value === false) return "trade-condition no";
    return "trade-condition neutral";
  };

  return (
    <section className="ad-page trade-ins-page" dir="rtl">

      <PageHead
        title="طلبات الاستبدال"
        text="مراجعة طلبات استبدال الأجهزة والتواصل مع العملاء"
        action={
          <button
            className="ad-btn primary trade-refresh-btn"
            type="button"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={18} />
            {loading ? "جاري التحديث..." : "تحديث الطلبات"}
          </button>
        }
      />

      {error && <div className="ad-error">{error}</div>}

      {loading ? (
        <div className="trade-empty">
          <RefreshCw className="trade-loading-icon" size={28} />
          <strong>جاري تحميل طلبات الاستبدال...</strong>
        </div>
      ) : items.length === 0 ? (
        <div className="trade-empty">
          <ClipboardList size={40} />
          <strong>لا توجد طلبات استبدال</strong>
          <span>ستظهر طلبات العملاء هنا عند إرسالها.</span>
        </div>
      ) : (
        <div className="trade-request-list">

          {items.map((item, index) => (
            <article className="trade-request-card" key={item.id}>

              {/* TOP */}
              <div className="trade-card-top">

                <div className="trade-request-number">
                  <span>طلب الاستبدال</span>
                  <strong>#{index + 1}</strong>
                </div>

                <div className="trade-created">
                  <span>تاريخ الطلب</span>
                  <strong dir="ltr">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString("en-GB")
                      : "—"}
                  </strong>
                </div>

                <div className="trade-status-box">
                  <label>حالة الطلب</label>

                  <select
                    value={item.status || "pending"}
                    onChange={(e) =>
                      updateItem(item.id, {
                        status: e.target.value,
                      })
                    }
                    disabled={savingId === item.id}
                  >
                    {statuses.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {savingId === item.id && (
                    <small>جاري الحفظ...</small>
                  )}
                </div>

              </div>

              {/* CUSTOMER + DEVICE */}
              <div className="trade-main-info">

                <div className="trade-info-card customer">
                  <div className="trade-info-icon">
                    <Users size={22} />
                  </div>

                  <div>
                    <span>العميل</span>

                    <strong>
                      {item.user_name || item.name || "—"}
                    </strong>

                    <a
                      href={`tel:${item.user_phone || item.phone || ""}`}
                      dir="ltr"
                    >
                      {item.user_phone || item.phone || "—"}
                    </a>
                  </div>
                </div>

                <div className="trade-info-card device">
                  <div className="trade-info-icon">
                    <ShoppingBag size={22} />
                  </div>

                  <div>
                    <span>الجهاز</span>

                    <strong>
                      {item.brand || "—"} {item.model || ""}
                    </strong>

                    <small>
                      {item.device_type || "—"} •{" "}
                      {item.storage || "—"}
                    </small>
                  </div>
                </div>

                <div className="trade-info-card battery">
                  <div className="trade-info-icon">
                    <CircleDollarSign size={22} />
                  </div>

                  <div>
                    <span>صحة البطارية</span>

                    <strong dir="ltr">
                      {item.battery_capacity
                        ? `${item.battery_capacity}%`
                        : "—"}
                    </strong>
                  </div>
                </div>

              </div>

              {/* CONDITIONS */}
              <div className="trade-section">

                <div className="trade-section-title">
                  <div>
                    <h3>حالة الجهاز</h3>
                    <p>إجابات العميل على أسئلة حالة الجهاز</p>
                  </div>
                </div>

                <div className="trade-conditions">

                  <div className={conditionClass(item.account_free)}>
                    <span>الحساب مفصول</span>
                    <strong>{yesNo(item.account_free)}</strong>
                  </div>

                  <div className={conditionClass(item.working)}>
                    <span>الجهاز يعمل</span>
                    <strong>{yesNo(item.working)}</strong>
                  </div>

                  <div className={conditionClass(item.surface_condition)}>
                    <span>خدوش سطحية</span>
                    <strong>{yesNo(item.surface_condition)}</strong>
                  </div>

                  <div className={conditionClass(item.screen_condition)}>
                    <span>حالة الشاشة</span>
                    <strong>{yesNo(item.screen_condition)}</strong>
                  </div>

                  <div className={conditionClass(item.body_condition)}>
                    <span>حالة الجسم</span>
                    <strong>{yesNo(item.body_condition)}</strong>
                  </div>

                  <div className={conditionClass(item.complete)}>
                    <span>الجهاز كامل</span>
                    <strong>{yesNo(item.complete)}</strong>
                  </div>

                </div>

              </div>

              {/* NOTES */}
              <div className="trade-notes-grid">

                <div className="trade-note-box">
                  <div className="trade-note-header">
                    <strong>ملاحظات العميل</strong>
                  </div>

                  <div className="trade-note-content">
                    {item.notes || "لا توجد ملاحظات من العميل."}
                  </div>
                </div>

                <div className="trade-note-box admin-note">
                  <div className="trade-note-header">
                    <strong>ملاحظات المدير</strong>
                    <span>يتم الحفظ عند الخروج من الحقل</span>
                  </div>

                  <textarea
                    defaultValue={item.admin_notes || ""}
                    placeholder="اكتب ملاحظاتك حول الطلب..."
                    rows={4}
                    onBlur={(e) => {
                      const value = e.target.value;

                      if (value !== (item.admin_notes || "")) {
                        updateItem(item.id, {
                          admin_notes: value,
                        });
                      }
                    }}
                  />
                </div>

              </div>

              {/* FOOTER */}
              <div className="trade-card-footer">

                <div>
                  <span>الحالة الحالية</span>
                  <strong>
                    {statusLabel(item.status || "pending")}
                  </strong>
                </div>

                <div>
                  <span>رقم الطلب</span>
                  <strong dir="ltr">
                    {String(item.id).slice(0, 8)}
                  </strong>
                </div>

              </div>

            </article>
          ))}

        </div>
      )}
    </section>
  );
}


function TradeInCatalog() {
  const [data, setData] = useState({
    device_types: [],
    brands: [],
    models: [],
    storage_options: [],
  });
  const [activeTab, setActiveTab] = useState("device_types");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);

  const tabs = [
    ["device_types", "أنواع الأجهزة"],
    ["brands", "العلامات التجارية"],
    ["models", "الموديلات"],
    ["storage_options", "السعات"],
  ];

  async function load() {
    try {
      setError("");
      const result = await api("/trade-in/admin/catalog");
      setData({
        device_types: Array.isArray(result?.device_types) ? result.device_types : [],
        brands: Array.isArray(result?.brands) ? result.brands : [],
        models: Array.isArray(result?.models) ? result.models : [],
        storage_options: Array.isArray(result?.storage_options) ? result.storage_options : [],
      });
    } catch (e) {
      setError(msg(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function saveItem(type, item) {
    try {
      setSaving(true);
      setError("");

      const pathMap = {
        device_types: "device-types",
        brands: "brands",
        models: "models",
        storage_options: "storage-options",
      };

      const resource = pathMap[type];
      const payload = { ...item };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      if (item.id) {
        await api(`/trade-in/admin/${resource}/${item.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await api(`/trade-in/admin/${resource}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setEditing(null);
      await load();
    } catch (e) {
      setError(msg(e));
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(type, id) {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟ سيتم حذف العناصر المرتبطة به أيضاً إذا كانت مرتبطة.")) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const pathMap = {
        device_types: "device-types",
        brands: "brands",
        models: "models",
        storage_options: "storage-options",
      };

      await api(`/trade-in/admin/${pathMap[type]}/${id}`, {
        method: "DELETE",
      });

      await load();
    } catch (e) {
      setError(msg(e));
    } finally {
      setSaving(false);
    }
  }

  const current = data[activeTab] || [];

  const deviceName = (id) => {
    const x = data.device_types.find((item) => item.id === id);
    return x ? `${x.name_ar} / ${x.name_en}` : "—";
  };

  const brandName = (id) => {
    const x = data.brands.find((item) => item.id === id);
    return x ? `${x.name_ar} / ${x.name_en}` : "—";
  };

  return (
    <section className="ad-page trade-catalog-page" dir="rtl">
      <PageHead
        title="إعدادات الاستبدال"
        text="إدارة أنواع الأجهزة والعلامات التجارية والموديلات والسعات التي تظهر للعملاء"
        action={
          <Button variant="primary" onClick={() => setEditing({ type: activeTab, item: {} })}>
            <Plus />
            إضافة
          </Button>
        }
      />

      {error && <div className="ad-error">{error}</div>}

      <div className="trade-catalog-tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={activeTab === id ? "active" : ""}
            onClick={() => {
              setActiveTab(id);
              setEditing(null);
            }}
          >
            {label}
            <span>{data[id]?.length || 0}</span>
          </button>
        ))}
      </div>

      <div className="trade-catalog-card">
        <div className="trade-catalog-list-head">
          <div>
            <h3>{tabs.find(([id]) => id === activeTab)?.[1]}</h3>
            <p>التغييرات تُحفظ مباشرة في قاعدة البيانات.</p>
          </div>
          <button className="ad-btn" onClick={load} disabled={saving}>
            <RefreshCw size={16} /> تحديث
          </button>
        </div>

        {current.length === 0 ? (
          <div className="trade-catalog-empty">لا توجد بيانات بعد.</div>
        ) : (
          <div className="trade-catalog-table-wrap">
            <table className="trade-catalog-table">
              <thead>
                <tr>
                  <th>الاسم / القيمة</th>
                  {activeTab === "device_types" && <th>السعات</th>}
                  {activeTab === "brands" && <th>نوع الجهاز</th>}
                  {activeTab === "models" && <><th>نوع الجهاز</th><th>العلامة</th></>}
                  {activeTab === "storage_options" && <th>نوع الجهاز</th>}
                  <th>الحالة</th>
                  <th>الترتيب</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {current.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {activeTab === "storage_options" ? (
                        <strong dir="ltr">{item.value}</strong>
                      ) : (
                        <>
                          <strong>{item.name_ar}</strong>
                          <small dir="ltr">{item.name_en}</small>
                        </>
                      )}
                    </td>

                    {activeTab === "device_types" && (
                      <td>{item.has_storage ? "نعم" : "لا"}</td>
                    )}

                    {activeTab === "brands" && (
                      <td>{deviceName(item.device_type_id)}</td>
                    )}

                    {activeTab === "models" && (
                      <>
                        <td>{deviceName(item.device_type_id)}</td>
                        <td>{brandName(item.brand_id)}</td>
                      </>
                    )}

                    {activeTab === "storage_options" && (
                      <td>{deviceName(item.device_type_id)}</td>
                    )}

                    <td>
                      <Badge ok={item.is_active !== false}>
                        {item.is_active !== false ? "نشط" : "غير نشط"}
                      </Badge>
                    </td>

                    <td>{item.sort_order ?? 0}</td>

                    <td>
                      <div className="ad-actions">
                        <button onClick={() => setEditing({ type: activeTab, item })}>
                          <Pencil />
                        </button>
                        <button className="danger" onClick={() => removeItem(activeTab, item.id)}>
                          <Trash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <TradeCatalogModal
          type={editing.type}
          item={editing.item}
          data={data}
          saving={saving}
          onClose={() => setEditing(null)}
          onSave={saveItem}
        />
      )}
    </section>
  );
}

function TradeCatalogModal({ type, item, data, saving, onClose, onSave }) {
  const [form, setForm] = useState({
    ...item,
    is_active: item.is_active !== false,
    sort_order: item.sort_order ?? 0,
    has_storage: item.has_storage ?? true,
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const titleMap = {
    device_types: "نوع جهاز",
    brands: "علامة تجارية",
    models: "موديل",
    storage_options: "سعة تخزين",
  };

  const submit = () => {
    const clean = { ...form };

    if (type === "storage_options") {
      clean.value = String(clean.value || "").trim();
      delete clean.name_ar;
      delete clean.name_en;
    } else {
      clean.name_ar = String(clean.name_ar || "").trim();
      clean.name_en = String(clean.name_en || "").trim();
    }

    onSave(type, clean);
  };

  return (
    <Modal title={form.id ? `تعديل ${titleMap[type]}` : `إضافة ${titleMap[type]}`} onClose={onClose}>
      <div className="ad-form trade-catalog-form">

        {type !== "storage_options" && (
          <>
            <Field
              label="الاسم بالعربية"
              value={form.name_ar}
              onChange={(v) => update("name_ar", v)}
            />
            <Field
              label="الاسم بالإنجليزية"
              value={form.name_en}
              onChange={(v) => update("name_en", v)}
              dir="ltr"
            />
          </>
        )}

        {type === "device_types" && (
          <label className="ad-check">
            <input
              type="checkbox"
              checked={!!form.has_storage}
              onChange={(e) => update("has_storage", e.target.checked)}
            />
            يحتوي على سعة تخزين
          </label>
        )}

        {(type === "brands" || type === "models" || type === "storage_options") && (
          <label className="ad-field">
            <span>نوع الجهاز</span>
            <select
              value={form.device_type_id || ""}
              onChange={(e) => update("device_type_id", e.target.value)}
            >
              <option value="">اختر نوع الجهاز</option>
              {data.device_types.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name_ar} / {x.name_en}
                </option>
              ))}
            </select>
          </label>
        )}

        {type === "models" && (
          <label className="ad-field">
            <span>العلامة التجارية</span>
            <select
              value={form.brand_id || ""}
              onChange={(e) => update("brand_id", e.target.value)}
            >
              <option value="">اختر العلامة</option>
              {data.brands
                .filter((x) => !form.device_type_id || x.device_type_id === form.device_type_id)
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name_ar} / {x.name_en}
                  </option>
                ))}
            </select>
          </label>
        )}

        {type === "storage_options" && (
          <Field
            label="السعة"
            value={form.value || ""}
            onChange={(v) => update("value", v)}
            dir="ltr"
          />
        )}

        <Field
          label="ترتيب العرض"
          value={form.sort_order}
          onChange={(v) => update("sort_order", v === "" ? 0 : Number(v))}
          dir="ltr"
        />

        <label className="ad-check">
          <input
            type="checkbox"
            checked={form.is_active !== false}
            onChange={(e) => update("is_active", e.target.checked)}
          />
          نشط
        </label>

        <div className="ad-modal-foot">
          <Button onClick={onClose}>إلغاء</Button>
          <Button variant="primary" disabled={saving} onClick={submit}>
            {saving ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </div>
      </div>
    </Modal>
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
  } else if (page === "trade-ins") {
    content = <TradeIns />;
  } else if (page === "trade-in-settings") {
    content = <TradeInCatalog />;
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