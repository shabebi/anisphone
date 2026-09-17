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
    };
  }

  switch (cleanPath) {
    case "/":
      return {
        page: "home",
        productSlug: null,
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
  if (window.location.pathname.includes("/admin")) {
    return <AdminApp />;
  }

  // IMPORTANT:
  // Read the current URL when the app first loads.
  // This makes refreshing /deals, /products, /faq, etc.
  // stay on that page instead of going back home.
  const initialRoute = getPageFromPath(window.location.pathname);

  const [language, setLanguage] = useState("ar");

  const [currentPage, setCurrentPage] = useState(
    initialRoute.page
  );

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [selectedProductSlug, setSelectedProductSlug] =
    useState(initialRoute.productSlug);

  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  // --------------------------------------------------
  // AUTH
  // --------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("anis_token");

    if (!token) return;

    fetch("http://localhost:5000/api/v1/auth/me", {
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
  // HANDLE BROWSER BACK / FORWARD
  // --------------------------------------------------

  useEffect(() => {
    function handlePopState() {
      const { page, productSlug } = getPageFromPath(
        window.location.pathname
      );

      setCurrentPage(page);
      setSelectedProductSlug(productSlug);

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

    setSelectedProductSlug(
      extra.productSlug ?? null
    );

    if (extra.category !== undefined) {
      setSelectedCategory(extra.category);
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goHome() {
    navigateTo("/", "home");
  }

  function goProducts(category = "all") {
    navigateTo("/products", "products", {
      category,
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

  function goAuth() {
    navigateTo("/auth", "auth");
  }

  function handleFooterNavigation(page) {
    if (page === "home") {
      goHome();
      return;
    }

    if (page === "faq") {
      goFaqs();
      return;
    }

    if (page === "products") {
      goProducts();
      return;
    }

    if (page === "deals") {
      goDeals();
      return;
    }

    if (page === "branches") {
      goBranches();
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
        "http://localhost:5000/api/v1/cart/items",
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
        "http://localhost:5000/api/v1/favorites/toggle",
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
        "http://localhost:5000/api/v1/favorites",
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
        user={user}
        onLanguageChange={setLanguage}
        onSearch={(query) => {
          console.log("Search:", query);
        }}
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
        onLogout={() => {
          localStorage.removeItem("anis_token");
          setUser(null);
        }}
      />

      {/* HOME */}
      {currentPage === "home" ? (
        <main>
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

          <RateUs
            language={language}
            user={user}
            onRequireAuth={() => {
              goAuth();
            }}
          />
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
      ) : currentPage === "auth" ? (
        /* AUTH */
        <main>
          <AuthPage
            onAuthenticated={(nextUser) => {
              setUser(nextUser);
              navigateTo("/", "home");
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
      <Footer
        language={language}
        onNavigate={handleFooterNavigation}
        onSocialClick={(social) => {
          console.log(
            "Social:",
            social
          );
        }}
      />
    </>
  );
}

export default App;