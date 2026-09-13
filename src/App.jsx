import { useEffect, useState } from "react";

import Header from "./components/Header";
import CategorySection from "./components/CategorySection";
import ProductSection from "./components/ProductSection";
import ProductsPage from "./components/ProductsPage";
import BranchesSection from "./components/BranchesSection";
import Footer from "./components/Footer";
import FAQs from "./components/faqs";
import AuthPage from "./components/AuthPage";
import DealsPage from "./components/DealsPage";
import BranchesPage from "./components/BranchesPage";

import AdminApp from "./admin/AdminApp";

function App() {
  if (
    window.location.pathname.includes("/admin")
  ) {
    return <AdminApp />;
  }

  const [language, setLanguage] = useState("en");
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("anis_token");
    if (!token) return;
    fetch("http://localhost:5000/api/v1/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((result) => setUser(result.data))
      .catch(() => localStorage.removeItem("anis_token"));
  }, []);

  function goHome() {
    setCurrentPage("home");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goProducts(category = "all") {
    setSelectedCategory(category);
    setCurrentPage("products");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goFaqs() {
    setCurrentPage("faq");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleFooterNavigation(page) {
    if (page === "home") goHome();
    if (page === "faq") goFaqs();
  }

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
          console.log("Wishlist clicked");
        }}
        onCart={() => {
          console.log("Cart clicked");
        }}
        onAccount={() => {
          setCurrentPage("auth");
        }}
        onHome={goHome}
        onProducts={goProducts}
        onDeals={() => {
          setSelectedCategory("all");
          setCurrentPage("deals");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onBranches={() => setCurrentPage("branches")}
        onLogout={() => { localStorage.removeItem("anis_token"); setUser(null); }}
      />

      {currentPage === "home" ? (
        <main>
          {/* Hero will be added here later */}

          <CategorySection
            language={language}
            onCategoryClick={(category) => {
              goProducts(category);
            }}
          />

          <ProductSection
            language={language}
            onProductClick={(id) => {
              console.log("Product clicked:", id);
            }}
            onAddToCart={(id) => {
              console.log("Add to cart:", id);
            }}
            onWishlist={(id) => {
              console.log("Wishlist:", id);
            }}
            onViewMore={goProducts}
          />

          <BranchesSection
            language={language}
            onExploreBranches={() => {
              setCurrentPage("branches");
            }}
            onBranchClick={(branchId) => {
              console.log("Branch clicked:", branchId);
            }}
          />

        </main>
      ) : currentPage === "faq" ? (
        <main>
          <FAQs language={language} onBack={goHome} />
        </main>
      ) : currentPage === "branches" ? (
        <main>
          <BranchesPage language={language} />
        </main>
      ) : currentPage === "auth" ? (
        <main><AuthPage onAuthenticated={(nextUser) => { setUser(nextUser); setCurrentPage("home"); }} /></main>
      ) : currentPage === "deals" ? (
        <main><DealsPage language={language} onProductClick={(id) => console.log("Product clicked:", id)} /></main>
      ) : (
        <main>
          <ProductsPage
            language={language}
            initialCategory={selectedCategory}
            onBack={goHome}
            onProductClick={(id) => {
              console.log("Product clicked:", id);
            }}
            onAddToCart={(id) => {
              console.log("Add to cart:", id);
            }}
            onWishlist={(id) => {
              console.log("Wishlist:", id);
            }}
          />
        </main>
      )}

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
