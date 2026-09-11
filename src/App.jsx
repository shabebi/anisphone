import { useState } from "react";

import Header from "./components/Header";
import CategorySection from "./components/CategorySection";
import ProductSection from "./components/ProductSection";
import BranchesSection from "./components/BranchesSection";
import Footer from "./components/Footer";

function App() {
  const [language, setLanguage] = useState("en");

  return (
    <>
      {/* Header */}
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
        onHome={() => {
          console.log("Home clicked");
        }}
        onProducts={() => {
          console.log("Products clicked");
        }}
        onDeals={() => {
          console.log("Deals clicked");
        }}
        onBranches={() => {
          console.log("Branches clicked");
        }}
      />

      <main>
        {/* Hero will be added here later by your friend */}

        {/* Core Categories */}
        <CategorySection
          language={language}
          onCategoryClick={(category) => {
            console.log("Category clicked:", category);
          }}
        />

        {/* Seasonal Curated Products */}
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
          onViewMore={() => {
            console.log("View more products");
          }}
        />
        <BranchesSection
          language={language}
          onExploreBranches={() => {
            console.log("Explore branches");
          }}
          onBranchClick={(branchId) => {
            console.log("Branch clicked:", branchId);
          }}
        />
        <Footer
          language={language}
          onNavigate={(page) => {
            console.log("Navigate:", page);
          }}
          onSocialClick={(social) => {
            console.log("Social:", social);
          }}
        />
      </main>
    </>
  );
}

export default App;