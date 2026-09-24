import { useEffect, useState } from "react";
import CartDrawer from "./components/CartDrawer";
import WishlistDrawer from "./components/WishlistDrawer";
import Header from "./components/Header";
import CategorySection from "./components/CategorySection";
import ProductSection from "./components/ProductSection";
import ProductsPage from "./components/ProductsPage";
import ProductDetailsPage from "./components/ProductDetailsPage";
import BranchesSection from "./components/BranchesSection";
import Footer from "./components/Footer";
import FAQs from "./components/faqs";
import AuthPage from "./components/AuthPage";
import DealsPage from "./components/DealsPage";
import BranchesPage from "./components/BranchesPage";
import AdminApp from "./admin/AdminApp";
import RateUs from "./components/Rateus";
import TradeInPage from "./components/TradeInPage";
import { SmartphoneHero } from "./components/Hero/SmartphoneHero";

const API_URL =
  window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api/v1"
    : "https://anisphone.onrender.com/api/v1";

function getProductSlugFromPath(pathname) {
  const match = pathname.match(/^\/products\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function getPageFromPath(pathname) {
  const cleanPath =
    pathname.replace(/\/+$/, "") || "/";

  const productSlug = getProductSlugFromPath(cleanPath);

  if (productSlug) {
    return {
      page: "product",
      productSlug,
      brand: "",
      searchQuery: "",
    };
  }

  if (cleanPath === "/products") {
    const params = new URLSearchParams(window.location.search);

    return {
      page: "products",
      productSlug: null,
      brand: params.get("brand") || "",
      searchQuery: "",
    };
  }

  switch (cleanPath) {
    case "/":
      return {
        page: "home",
        productSlug: null,
        searchQuery: "",
      };

    case "/products":
      return {
        page: "products",
        productSlug: null,
      };

    case "/deals":
      return {
        page: "deals",
        productSlug: null,
      };

    case "/branches":
      return {
        page: "branches",
        productSlug: null,
      };

    case "/trade-in":
      return {
        page: "trade-in",
        productSlug: null,
      };

    case "/faq":
      return {
        page: "faq",
        productSlug: null,
      };

    case "/auth":
      return {
        page: "auth",
        productSlug: null,
      };

    default:
      return {
        page: "home",
        productSlug: null,
      };
  }
}

function App() {
  const pathname = window.location.pathname;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  if (
    pathname === `${base}/admin` ||
    pathname.startsWith(`${base}/admin/`)
  ) {
    return <AdminApp />;
  }

  // IMPORTANT:
  // Read the current URL when the app first loads.
  // This makes refreshing /deals, /products, /faq, etc.
  // stay on that page instead of going back home.
  const initialRoute = getPageFromPath(window.location.pathname);

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("anis_language") || "ar";
  });

  const [heroActive, setHeroActive] = useState(true);

  const [searchIndex, setSearchIndex] = useState([]);

  const [currentPage, setCurrentPage] = useState(
    initialRoute.page
  );

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [selectedProductSlug, setSelectedProductSlug] =
    useState(initialRoute.productSlug);

  const [selectedBrand, setSelectedBrand] = useState(
    initialRoute.brand || ""
  );

  const [searchQueryState, setSearchQueryState] = useState(
    initialRoute.searchQuery || ""
  );

  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector(".hero-stage");

      if (!hero) return;

      const rect = hero.getBoundingClientRect();

      setHeroActive(rect.bottom > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("anis_token");

    if (!token) return;

    fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) =>
        response.ok ? response.json() : Promise.reject()
      )
      .then((result) => setUser(result.data))
      .catch(() => {
        localStorage.removeItem("anis_token");
      });
  }, []);

  // --------------------------------------------------
  // SEARCH INDEX
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadSearchIndex() {
      try {
        const response = await fetch(
          `${API_URL}/products?limit=1000`
        );

        if (!response.ok) {
          throw new Error("Failed to load products for search");
        }

        const result = await response.json();
        const data = result?.data;

        if (!cancelled) {
          setSearchIndex(
            Array.isArray(data)
              ? data
              : data?.items || []
          );
        }
      } catch (error) {
        console.error("Search index error:", error);
        if (!cancelled) setSearchIndex([]);
      }
    }

    loadSearchIndex();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // HANDLE BROWSER BACK / FORWARD
  // --------------------------------------------------

  useEffect(() => {
    function handlePopState() {
      const route = getPageFromPath(window.location.pathname);

      setCurrentPage(route.page);
      setSelectedProductSlug(route.productSlug);
      setSelectedBrand(route.brand || "");
      setSearchQueryState(route.searchQuery || "");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // --------------------------------------------------
  // NAVIGATION
  // --------------------------------------------------

  function navigateTo(path, page, extra = {}) {
    const currentPath =
      window.location.pathname.replace(/\/+$/, "") || "/";

    if (currentPath !== path) {
      window.history.pushState({}, "", path);
    }

    setCurrentPage(page);

    setSearchQueryState(
      extra.searchQuery !== undefined ? extra.searchQuery : ""
    );

    setSelectedProductSlug(
      extra.productSlug ?? null
    );

    if (extra.brand !== undefined) {
      setSelectedBrand(extra.brand || "");
    }

    if (extra.category !== undefined) {
      setSelectedCategory(extra.category);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function scrollToHomeSection(id) {
    const scroll = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    // Wait for the homepage to render before scrolling.
    requestAnimationFrame(() => {
      requestAnimationFrame(scroll);
    });
  }

  function goRateUs() {
    const scrollToRateUs = () => {
      const element = document.getElementById(
        "rate-us-section"
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    if (
      window.location.pathname !== "/" ||
      currentPage !== "home"
    ) {
      goHome();

      // Wait until Home has rendered.
      setTimeout(scrollToRateUs, 150);

      return;
    }

    scrollToRateUs();
  }

  function goContact() {
    if (window.location.pathname !== "/" || currentPage !== "home") {
      goHome();
    }

    scrollToHomeSection("site-footer");
  }

  function goSearch(query) {
    // ============================================
    // DROPDOWN SUGGESTION CLICK
    // ============================================

    if (query && typeof query === "object") {
      // ----------------------------
      // PAGE
      // ----------------------------

      if (query.type === "page") {
        switch (query.page) {
          case "home":
            goHome();
            return;

          case "products":
            goProducts("all");
            return;

          case "deals":
            goDeals();
            return;

          case "branches":
            goBranches();
            return;

          case "faq":
            goFaqs();
            return;

          case "auth":
            goAuth();
            return;

          // IMPORTANT:
          // Header uses "rateus"
          case "rateus":
          case "rate-us":
            goRateUs();
            return;

          case "contact":
            goContact();
            return;

          default:
            return;
        }
      }

      // ----------------------------
      // BRAND
      // ----------------------------

      if (query.type === "brand") {
        if (!query.slug) return;

        // IMPORTANT:
        // First argument = category
        // Second argument = brand
        goProducts("all", query.slug);
        return;
      }

      // ----------------------------
      // PRODUCT
      // ----------------------------

      if (query.type === "product") {
        if (!query.product) return;

        openProduct(query.product);
        return;
      }

      return;
    }

    // ============================================
    // NORMAL TEXT SEARCH
    // ============================================

    const cleanQuery = String(query || "").trim();

    if (!cleanQuery) return;

    const normalized = cleanQuery
      .toLocaleLowerCase()
      .replace(/\s+/g, " ")
      .trim();

    // ============================================
    // PAGE SEARCH
    // ============================================

    const pageAliases = {
      home: [
        "home",
        "الرئيسية",
        "الرئيسيه",
      ],

      products: [
        "products",
        "product",
        "all products",
        "كافة المنتجات",
        "المنتجات",
        "منتجات",
      ],

      deals: [
        "deals",
        "deal",
        "discount",
        "discounts",
        "deals & discounts",
        "العروض",
        "الخصومات",
        "عرض",
        "خصومات",
        "العروض والخصومات",
      ],

      branches: [
        "branches",
        "branch",
        "الفروع",
        "فرع",
      ],

      faq: [
        "faq",
        "questions",
        "frequently asked",
        "الأسئلة",
        "الاسئلة",
        "الأسئلة الشائعة",
      ],

      rateus: [
        "rate us",
        "rateus",
        "rate-us",
        "rate",
        "rating",
        "review",
        "reviews",
        "قيمنا",
        "قيّمنا",
        "تقييم",
        "التقييم",
        "تقييمنا",
      ],

      contact: [
        "contact",
        "contacts",
        "contact us",
        "تواصل",
        "تواصل معنا",
        "اتصل",
        "اتصل بنا",
        "التواصل",
      ],

      auth: [
        "account",
        "login",
        "sign in",
        "الحساب",
        "تسجيل الدخول",
      ],
    };

    const normalizeSearchValue = (value) =>
      String(value || "")
        .trim()
        .toLocaleLowerCase()
        .replace(/[ً-ٟ]/g, "")
        .replace(/\s+/g, " ");

    // ============================================
    // EXACT PAGE
    // ============================================

    for (const [page, aliases] of Object.entries(pageAliases)) {
      if (
        aliases.some(
          (alias) =>
            normalizeSearchValue(alias) === normalized
        )
      ) {
        goSearch({
          type: "page",
          page,
        });

        return;
      }
    }

    // ============================================
    // EXACT BRAND
    // ============================================

    const exactBrand = searchIndex.find((product) => {
      const brands = [
        product?.brand_name_en,
        product?.brand_name_ar,
        product?.brand_slug,
      ]
        .filter(Boolean)
        .map(normalizeSearchValue);

      return brands.includes(normalized);
    });

    if (exactBrand?.brand_slug) {
      // IMPORTANT:
      // category = "all"
      // brand = brand slug
      goProducts("all", exactBrand.brand_slug);
      return;
    }

    // ============================================
    // EXACT PRODUCT
    // ============================================

    const exactProduct = searchIndex.find((product) => {
      const names = [
        product?.name_en,
        product?.name_ar,
        product?.slug,
      ]
        .filter(Boolean)
        .map(normalizeSearchValue);

      return names.includes(normalized);
    });

    if (exactProduct) {
      openProduct(exactProduct);
      return;
    }

    // ============================================
    // SPECIFICATION SEARCH
    // ============================================

    const queryTokens = normalized
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean);

    if (queryTokens.length > 0) {
      const matchingProduct = searchIndex.find((product) => {
        const specifications = Array.isArray(
          product?.specifications
        )
          ? product.specifications.flatMap((spec) => [
            spec?.name_ar,
            spec?.name_en,
            spec?.value_ar,
            spec?.value_en,
            spec?.section_ar,
            spec?.section_en,
          ])
          : [];

        const searchableValues = [
          product?.name_en,
          product?.name_ar,
          product?.slug,
          product?.brand_name_en,
          product?.brand_name_ar,
          product?.category_name_en,
          product?.category_name_ar,
          product?.description_en,
          product?.description_ar,
          product?.condition,
          ...specifications,
        ]
          .filter(Boolean)
          .map(normalizeSearchValue);

        return searchableValues.some((value) => {
          const valueTokens = value
            .split(/[^\p{L}\p{N}]+/u)
            .filter(Boolean);

          return queryTokens.every((queryToken) =>
            valueTokens.some(
              (valueToken) =>
                valueToken === queryToken ||
                (queryToken.length >= 3 &&
                  valueToken.startsWith(queryToken))
            )
          );
        });
      });

      if (matchingProduct) {
        openProduct(matchingProduct);
        return;
      }
    }

    // Nothing matched
  }

  function goHome() {
    navigateTo("/", "home");
  }

  function goProducts(category = "all", brand = "") {
    const path = brand
      ? `/products?brand=${encodeURIComponent(brand)}`
      : "/products";

    navigateTo(path, "products", {
      category,
      brand,
    });
  }

  function openProduct(product) {
    if (!product) return;

    if (typeof product === "object") {
      if (!product.slug) {
        console.error(
          "Product slug is missing:",
          product
        );
        return;
      }

      navigateTo(
        `/products/${encodeURIComponent(product.slug)}`,
        "product",
        {
          productSlug: product.slug,
        }
      );

      return;
    }

    if (typeof product === "string") {
      navigateTo(
        `/products/${encodeURIComponent(product)}`,
        "product",
        {
          productSlug: product,
        }
      );
    }
  }

  function goFaqs() {
    navigateTo("/faq", "faq");
  }

  function goDeals() {
    navigateTo("/deals", "deals", {
      category: "all",
    });
  }

  function goBranches() {
    navigateTo("/branches", "branches");
  }

  function goTradeIn() {
    if (!user) {
      sessionStorage.setItem("anis_return_after_auth", "trade-in");
      goAuth();
      return;
    }

    navigateTo("/trade-in", "trade-in");
  }

  function goAuth() {
    navigateTo("/auth", "auth");
  }

  function handleFooterNavigation(page) {
    switch (page) {
      case "home":
        goHome();
        return;

      case "products":
        goProducts("all");
        return;

      case "deals":
        goDeals();
        return;

      case "branches":
        goBranches();
        return;

      case "faq":
        goFaqs();
        return;

      case "auth":
        goAuth();
        return;

      case "rateus":
      case "rate-us":
        goRateUs();
        return;

      case "contact":
        goContact();
        return;

      default:
        return;
    }
  }

  // --------------------------------------------------
  // CART
  // --------------------------------------------------

  const handleAddToCart = async (
    productId,
    selection = {}
  ) => {
    if (!user) {
      goAuth();
      return;
    }

    const token = localStorage.getItem("anis_token");

    if (!token) {
      goAuth();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/cart/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: productId,
            quantity: 1,
            variant_id:
              selection.variantId || null,
            color_id:
              selection.colorId || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to add product to cart"
        );
      }

      setCart(result.data);
      setCartOpen(true);
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      alert(
        error.message ||
        "Failed to add product to cart"
      );
    }
  };

  // --------------------------------------------------
  // WISHLIST
  // --------------------------------------------------

  const handleWishlist = async (product) => {
    if (!user) {
      goAuth();
      return;
    }

    const token = localStorage.getItem("anis_token");

    if (!token) {
      goAuth();
      return;
    }

    // Support all product formats
    const productId =
      typeof product === "string"
        ? product
        : product?.id ||
        product?.product_id ||
        product?.productId;

    if (!productId) {
      console.error(
        "Wishlist: missing product ID:",
        product
      );

      alert("Product ID is missing.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/favorites/toggle`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId,
            product_id: productId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Failed to update wishlist"
        );
      }

      // Reload wishlist after toggle
      const wishlistResponse = await fetch(
        `${API_URL}/favorites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const wishlistResult =
        await wishlistResponse.json();

      if (!wishlistResponse.ok) {
        throw new Error(
          wishlistResult?.message ||
          "Failed to load wishlist"
        );
      }

      const wishlistData =
        wishlistResult.data;

      setWishlist(
        Array.isArray(wishlistData)
          ? wishlistData
          : wishlistData?.items || []
      );

      setWishlistOpen(true);
    } catch (error) {
      console.error(
        "Wishlist error:",
        error
      );

      alert(
        error.message ||
        "Failed to update wishlist"
      );
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <>
      <Header
        language={language}
        activePage={currentPage}
        className={heroActive ? "hero-header" : "header-scrolled"}
        user={user}
        onLanguageChange={(newLanguage) => {
          setLanguage(newLanguage);
          localStorage.setItem("anis_language", newLanguage);
        }}
        searchIndex={searchIndex}
        onSearch={goSearch}
        onWishlist={() => {
          if (!user) {
            goAuth();
            return;
          }

          setWishlistOpen(true);
        }}
        onCart={() => {
          if (!user) {
            goAuth();
            return;
          }

          setCartOpen(true);
        }}
        onAccount={() => {
          goAuth();
        }}
        onHome={goHome}
        onProducts={goProducts}
        onDeals={goDeals}
        onBranches={goBranches}
        onTradeIn={goTradeIn}
        onLogout={() => {
          localStorage.removeItem("anis_token");
          setUser(null);
        }}
      />

      {/* HOME */}
      {currentPage === "home" ? (
        <main>
          <SmartphoneHero language={language} />
          <CategorySection
            language={language}
            onCategoryClick={(category) => {
              goProducts(category);
            }}
          />

          <ProductSection
            language={language}
            onProductClick={openProduct}
            onAddToCart={handleAddToCart}
            onWishlist={handleWishlist}
            onViewMore={goProducts}
          />

          <BranchesSection
            language={language}
            onExploreBranches={goBranches}
            onBranchClick={(branchId) => {
              console.log(
                "Branch clicked:",
                branchId
              );
            }}
          />

          <div id="rate-us-section">
            <RateUs
              language={language}
              user={user}
              onRequireAuth={() => {
                goAuth();
              }}
            />
          </div>
        </main>
      ) : currentPage === "faq" ? (
        /* FAQ */
        <main>
          <FAQs
            language={language}
            onBack={goHome}
          />
        </main>
      ) : currentPage === "branches" ? (
        /* BRANCHES */
        <main>
          <BranchesPage
            language={language}
          />
        </main>
      ) : currentPage === "trade-in" ? (
        <main>
          <TradeInPage
            language={language}
            user={user}
          />
        </main>
      ) : currentPage === "auth" ? (
        /* AUTH */
        <main>
          <AuthPage
            language={language}
            onLanguageChange={(newLanguage) => {
              setLanguage(newLanguage);
              localStorage.setItem(
                "anis_language",
                newLanguage
              );
            }}
            onAuthenticated={(nextUser) => {
              setUser(nextUser);

              const returnPage = sessionStorage.getItem("anis_return_after_auth");
              sessionStorage.removeItem("anis_return_after_auth");

              if (returnPage === "trade-in") {
                navigateTo("/trade-in", "trade-in");
              } else {
                navigateTo("/", "home");
              }
            }}
          />
        </main>
      ) : currentPage === "deals" ? (
        /* DEALS */
        <main>
          <DealsPage
            language={language}
            onProductClick={openProduct}
            onWishlist={handleWishlist}
          />
        </main>
      ) : currentPage === "product" ? (
        /* PRODUCT DETAILS */
        <main>
          <ProductDetailsPage
            productSlug={selectedProductSlug}
            language={language}
            onBack={() =>
              goProducts(selectedCategory)
            }
            onProductClick={openProduct}
            onAddToCart={handleAddToCart}
            onWishlist={handleWishlist}
          />
        </main>
      ) : (
        /* PRODUCTS */
        <main>
          <ProductsPage
            language={language}
            initialCategory={selectedCategory}
            initialBrand={selectedBrand}
            onBack={goHome}
            onProductClick={openProduct}
            onAddToCart={handleAddToCart}
            onWishlist={handleWishlist}
          />
        </main>
      )}

      {/* CART */}
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        setCart={setCart}
        language={language}
      />

      {/* WISHLIST */}
      <WishlistDrawer
        open={wishlistOpen}
        onClose={() =>
          setWishlistOpen(false)
        }
        wishlist={wishlist}
        setWishlist={setWishlist}
        language={language}
        onAddToCart={handleAddToCart}
      />

      {/* FOOTER */}
      <div id="site-footer">
        <Footer
          language={language}
          onNavigate={handleFooterNavigation}
          onSocialClick={(social) => {
            console.log("Social:", social);
          }}
        />
      </div>
    </>
  );
}

export default App;