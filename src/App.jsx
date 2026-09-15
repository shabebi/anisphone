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

function getProductSlugFromPath(pathname) {
  const match = pathname.match(/^\/products\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : null;
}

function App() {
  if (window.location.pathname.includes("/admin")) {
    return <AdminApp />;
  }

  const initialProductSlug = getProductSlugFromPath(
    window.location.pathname
  );

  const [language, setLanguage] = useState("en");

  const [currentPage, setCurrentPage] = useState(
    initialProductSlug ? "product" : "home"
  );

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [selectedProductSlug, setSelectedProductSlug] =
    useState(initialProductSlug);

  const [user, setUser] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState([]);

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
      .catch(() => localStorage.removeItem("anis_token"));
  }, []);

  useEffect(() => {
    function handlePopState() {
      const productSlug = getProductSlugFromPath(
        window.location.pathname
      );

      if (productSlug) {
        setSelectedProductSlug(productSlug);
        setCurrentPage("product");
        return;
      }

      setSelectedProductSlug(null);

      if (window.location.pathname === "/") {
        setCurrentPage("home");
      } else {
        setCurrentPage("home");
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function goHome() {
    setCurrentPage("home");
    setSelectedProductSlug(null);

    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goProducts(category = "all") {
    setSelectedCategory(category);
    setCurrentPage("products");
    setSelectedProductSlug(null);

    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openProduct(product) {
    if (!product) return;

    /*
     * Product components should pass the complete product object.
     *
     * Example:
     * onProductClick(product)
     *
     * The slug is used for the clean URL.
     */
    if (typeof product === "object") {
      if (!product.slug) {
        console.error("Product slug is missing:", product);
        return;
      }

      setSelectedProductSlug(product.slug);
      setCurrentPage("product");

      window.history.pushState(
        {},
        "",
        `/products/${encodeURIComponent(product.slug)}`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    /*
     * Fallback for components that still pass a string.
     *
     * This treats the string as a slug so existing functionality
     * does not crash while the components are being updated.
     */
    if (typeof product === "string") {
      setSelectedProductSlug(product);
      setCurrentPage("product");

      window.history.pushState(
        {},
        "",
        `/products/${encodeURIComponent(product)}`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function goFaqs() {
    setCurrentPage("faq");
    setSelectedProductSlug(null);

    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goDeals() {
    setSelectedCategory("all");
    setCurrentPage("deals");
    setSelectedProductSlug(null);

    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goBranches() {
    setCurrentPage("branches");
    setSelectedProductSlug(null);

    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleFooterNavigation(page) {
    if (page === "home") {
      goHome();
    }

    if (page === "faq") {
      goFaqs();
    }
  }

  const handleAddToCart = async (productId, selection = {}) => {
  if (!user) {
    setCurrentPage("auth");
    return;
  }

  const token = localStorage.getItem("anis_token");

  if (!token) {
    setCurrentPage("auth");
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
          variant_id: selection.variantId || null,
          color_id: selection.colorId || null,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.message || "Failed to add product to cart"
      );
    }

    setCart(result.data);
    setCartOpen(true);
  } catch (error) {
    console.error("Add to cart error:", error);
    alert(error.message || "Failed to add product to cart");
  }
};

  const handleWishlist = async (product) => {
  if (!user) {
    setCurrentPage("auth");
    return;
  }

  const token = localStorage.getItem("anis_token");

  if (!token) {
    setCurrentPage("auth");
    return;
  }

  // Support all product formats coming from the different components
  const productId =
    typeof product === "string"
      ? product
      : product?.id ||
        product?.product_id ||
        product?.productId;

  if (!productId) {
    console.error("Wishlist: missing product ID:", product);
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
        result?.message || "Failed to update wishlist"
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

    const wishlistResult = await wishlistResponse.json();

    if (!wishlistResponse.ok) {
      throw new Error(
        wishlistResult?.message || "Failed to load wishlist"
      );
    }

    const wishlistData = wishlistResult.data;

    setWishlist(
      Array.isArray(wishlistData)
        ? wishlistData
        : wishlistData?.items || []
    );

    setWishlistOpen(true);
  } catch (error) {
    console.error("Wishlist error:", error);
    alert(error.message || "Failed to update wishlist");
  }
};

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
            setCurrentPage("auth");
            return;
          }

          setWishlistOpen(true);
        }}
        onCart={() => {
          if (!user) {
            setCurrentPage("auth");
            return;
          }

          setCartOpen(true);
        }}
        onAccount={() => {
          setCurrentPage("auth");
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
              console.log("Branch clicked:", branchId);
            }}
          />
        </main>
      ) : currentPage === "faq" ? (
        <main>
          <FAQs
            language={language}
            onBack={goHome}
          />
        </main>
      ) : currentPage === "branches" ? (
        <main>
          <BranchesPage language={language} />
        </main>
      ) : currentPage === "auth" ? (
        <main>
          <AuthPage
            onAuthenticated={(nextUser) => {
              setUser(nextUser);
              setCurrentPage("home");

              if (window.location.pathname !== "/") {
                window.history.pushState({}, "", "/");
              }
            }}
          />
        </main>
      ) : currentPage === "deals" ? (
        <main>
          <DealsPage
            language={language}
            onProductClick={openProduct}
          />
        </main>
      ) : currentPage === "product" ? (
        <main>
          <ProductDetailsPage
            productSlug={selectedProductSlug}
            language={language}
            onBack={() => goProducts(selectedCategory)}
            onProductClick={openProduct}
            onAddToCart={handleAddToCart}
            onWishlist={handleWishlist}
          />
        </main>
      ) : (
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

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        setCart={setCart}
        language={language}
      />

      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlist={wishlist}
        setWishlist={setWishlist}
        language={language}
        onAddToCart={handleAddToCart}
      />

      <Footer
        language={language}
        onNavigate={handleFooterNavigation}
        onSocialClick={(social) => {
          console.log("Social:", social);
        }}
      />
    </>
  );
}

export default App;