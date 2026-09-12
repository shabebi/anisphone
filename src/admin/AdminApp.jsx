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

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
  ["offers", "العروض", CircleDollarSign],
  ["branches", "الفروع", Building2],
  ["banners", "البنرات", FileText],
  ["faqs", "الأسئلة الشائعة", MessageSquare],
  ["homepage", "الصفحة الرئيسية", Home],
  ["users", "المستخدمون", Shield],
  ["reports", "التقارير", BarChart3],
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

  useEffect(() => {
    api("/admin/stats")
      .then(setS)
      .catch(() => { });
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
        api("/products?admin=true"),
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
      if (data.id) {
        await api(`/products/${data.id}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        });
      } else {
        await api("/products", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }

      setEdit(null);
      load();
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
          onChange={(v) =>
            setD({
              ...d,
              slug: v,
            })
          }
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
                setD({
                  ...d,
                  category_id: e.target.value,
                })
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
                setD({
                  ...d,
                  brand_id: e.target.value,
                })
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
            onChange={(v) =>
              setD({
                ...d,
                price: v,
              })
            }
            dir="ltr"
          />

          <Field
            label="السعر القديم"
            value={d.old_price}
            onChange={(v) =>
              setD({
                ...d,
                old_price: v || null,
              })
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
                  setD({
                    ...d,
                    [k]: e.target.checked,
                  })
                }
              />

              {l}
            </label>
          ))}
        </div>

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
      ["image", "رابط الصورة"],
    ],
  },

  brands: {
    title: "العلامات التجارية",
    resource: "brands",
    fields: [
      ["name_ar", "الاسم بالعربية"],
      ["name_en", "الاسم بالإنجليزية"],
      ["slug", "الرابط المختصر"],
      ["logo", "رابط الشعار"],
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

  offers: {
    title: "العروض",
    resource: "offers",
    fields: [
      ["name_ar", "اسم العرض بالعربية"],
      ["name_en", "اسم العرض بالإنجليزية"],
      ["description_ar", "الوصف بالعربية"],
      ["description_en", "الوصف بالإنجليزية"],
      ["discount_type", "نوع الخصم"],
      ["discount_value", "قيمة الخصم"],
      ["start_at", "تاريخ البداية"],
      ["end_at", "تاريخ النهاية"],
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

        {config.resource === "offers" && (
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
    setP(await api("/products?admin=true"));
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

  useEffect(() => {
    api("/orders/admin")
      .then(setX)
      .catch(() => { });
  }, []);

  return (
    <section className="ad-page">
      <PageHead
        title="الطلبات"
        text="الطلبات المسجلة عبر واتساب"
      />

      <div className="ad-table">
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

  useEffect(() => {
    api("/admin/users")
      .then(setX)
      .catch(() => { });
  }, []);

  async function toggle(u) {
    await api(`/admin/users/${u.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        is_active: !u.is_active,
      }),
    });

    setX(
      x.map((a) =>
        a.id === u.id
          ? {
            ...a,
            is_active: !a.is_active,
          }
          : a
      )
    );
  }

  return (
    <section className="ad-page">
      <PageHead
        title="العملاء"
        text="المستخدمون المسجلون في المتجر"
      />

      <div className="ad-table">
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
  const [x, setX] = useState([]);

  async function load() {
    setX(await api("/reviews/admin/all"));
  }

  useEffect(() => {
    load().catch(() => { });
  }, []);

  async function approve(r, v) {
    await api(
      `/reviews/admin/${r.id}/approve`,
      {
        method: "PATCH",
        body: JSON.stringify({
          approved: v,
        }),
      }
    );

    load();
  }

  return (
    <section className="ad-page">
      <PageHead
        title="التقييمات"
        text="مراجعة واعتماد تقييمات العملاء"
      />

      <div className="ad-card ad-reviews">
        {x.map((r) => (
          <div className="ad-review" key={r.id}>
            <div className="ad-avatar">
              {r.user_name?.[0]}
            </div>

            <div className="grow">
              <b>{r.user_name}</b>

              <small>
                {r.product_name_ar}
              </small>

              <div className="stars">
                {"★".repeat(r.rating)}
                {"☆".repeat(5 - r.rating)}
              </div>

              <p>{r.comment_ar}</p>
            </div>

            <div>
              {r.is_approved ? (
                <Button
                  onClick={() =>
                    approve(r, false)
                  }
                >
                  إخفاء
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() =>
                    approve(r, true)
                  }
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
      fields: [
        "title_ar",
        "title_en",
        "description_ar",
        "description_en",
        "image_url",
      ],
      labels: [
        "العنوان بالعربية",
        "العنوان بالإنجليزية",
        "الوصف بالعربية",
        "الوصف بالإنجليزية",
        "رابط الصورة",
      ],
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

    homepage: {
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

  async function load() {
    setItems(
      await api(`/content/${type}?all=true`)
    );
  }

  useEffect(() => {
    load().catch(() => { });
  }, []);

  async function save(d) {
    try {
      if (d.id) {
        await api(`/content/${type}/${d.id}`, {
          method: "PATCH",
          body: JSON.stringify(d),
        });
      } else {
        await api(`/content/${type}`, {
          method: "POST",
          body: JSON.stringify(d),
        });
      }

      setEdit(null);
      load();
    } catch (e) {
      alert(msg(e));
    }
  }

  async function del(id) {
    if (
      confirm("هل أنت متأكد من الحذف؟")
    ) {
      await api(`/content/${type}/${id}`, {
        method: "DELETE",
      });

      load();
    }
  }

  return (
    <section className="ad-page">
      <PageHead
        title={title}
        text="إدارة المحتوى المخزن في قاعدة البيانات"
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

      <div className="ad-card ad-list">
        {items.map((x) => (
          <div
            className="ad-list-row"
            key={x.id}
          >
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

            <Badge
              ok={x.is_active !== false}
            >
              {x.is_active === false
                ? "غير نشط"
                : "نشط"}
            </Badge>

            <div className="ad-actions">
              <button
                onClick={() => setEdit(x)}
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
        ))}
      </div>

      {edit && (
        <Modal
          title={edit.id ? "تعديل" : "إضافة"}
          onClose={() => setEdit(null)}
        >
          <div className="ad-form">
            {cfg.fields.map((k, i) => (
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
            ))}

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
              >
                إلغاء
              </Button>

              <Button
                variant="primary"
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

function Reports() {
  return (
    <section className="ad-page">
      <PageHead
        title="التقارير"
        text="إحصاءات قابلة للتوسع عند ربط بيانات المبيعات الفعلية"
      />

      <div className="ad-card ad-report">
        <BarChart3 />

        <h3>بيانات المبيعات</h3>

        <p>
          قاعدة البيانات الحالية لا تحتوي جدولاً
          مالياً للطلبات؛ الطلبات الموجودة هي
          whatsapp_orders فقط. لذلك لن أضع أرقام
          مبيعات وهمية.
        </p>
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
  } else if (page === "customers") {
    content = <Customers />;
  } else if (page === "reviews") {
    content = <Reviews />;
  } else if (page === "reports") {
    content = <Reports />;
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
  } else if (page === "homepage") {
    content = (
      <ContentPage
        type="homepage"
        title="الصفحة الرئيسية"
      />
    );
  } else {
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