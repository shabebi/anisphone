import { useState } from "react";

import Header from "./components/Header";
import CategorySection from "./components/CategorySection";
import ProductSection from "./components/ProductSection";
import ProductsPage from "./components/ProductsPage";
import BranchesSection from "./components/BranchesSection";
import Footer from "./components/Footer";

function App() {
  const [language, setLanguage] = useState("en");
  const [currentPage, setCurrentPage] =
    useState("home");

  function goHome() {
    setCurrentPage("home");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goProducts() {
    setCurrentPage("products");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <>
      <Header
        language={language}
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
          console.log("Account clicked");
        }}
        onHome={goHome}
        onProducts={goProducts}
        onDeals={() => {
          console.log("Deals clicked");
        }}
        onBranches={() => {
          console.log("Branches clicked");
        }}
      />

      {currentPage === "home" ? (
        <main>
          {/* Hero will be added here later */}

          <CategorySection
            language={language}
            onCategoryClick={(category) => {
              console.log(
                "Category clicked:",
                category
              );
            }}
          />

          <ProductSection
            language={language}
            onProductClick={(id) => {
              console.log(
                "Product clicked:",
                id
              );
            }}
            onAddToCart={(id) => {
              console.log(
                "Add to cart:",
                id
              );
            }}
            onWishlist={(id) => {
              console.log(
                "Wishlist:",
                id
              );
            }}
            onViewMore={goProducts}
          />

          <BranchesSection
            language={language}
            onExploreBranches={() => {
              console.log(
                "Explore branches"
              );
            }}
            onBranchClick={(branchId) => {
              console.log(
                "Branch clicked:",
                branchId
              );
            }}
          />

          <Footer
            language={language}
            onNavigate={(page) => {
              console.log(
                "Navigate:",
                page
              );
            }}
            onSocialClick={(social) => {
              console.log(
                "Social:",
                social
              );
            }}
          />
        </main>
      ) : (
        <main>
          <ProductsPage
            language={language}
            onBack={goHome}
            onProductClick={(id) => {
              console.log(
                "Product clicked:",
                id
              );
            }}
            onAddToCart={(id) => {
              console.log(
                "Add to cart:",
                id
              );
            }}
            onWishlist={(id) => {
              console.log(
                "Wishlist:",
                id
              );
            }}
          />
        </main>
      )}
    </>
  );
}

export default App;