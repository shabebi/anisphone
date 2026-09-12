import React, { useEffect, useMemo, useState } from "react";
import "./ProductsPage.css";

import titaniumImage from "../assets/titanium-pro-max-5g.png";
import foldableImage from "../assets/foldable-ultra-2025.png";
import ceramicImage from "../assets/ceramic-edition-flagship.png";
import desertGoldImage from "../assets/desert-gold-studio-edition.png";

const API_URL = "http://localhost:5000/api/v1";

const fallbackImages = [
    titaniumImage,
    foldableImage,
    ceramicImage,
    desertGoldImage,
];

export default function ProductsPage({
    language = "en",
    onProductClick,
    onAddToCart,
    onWishlist,
    onBack,
}) {
    const isArabic = language === "ar";

    const [products, setProducts] = useState([]);
    const [activeFilter, setActiveFilter] =
        useState("all");
    const [selectedCategory, setSelectedCategory] =
        useState("all");
    const [loading, setLoading] = useState(true);

    const content = {
        en: {
            eyebrow: "ANIS PHONE STORE",
            title: "All Products",
            back: "Back",
            all: "All",
            bestsellers: "Best Sellers",
            new: "New Arrivals",
            deals: "Top Deals",
            categories: "Categories",
            loading: "Loading products...",
            empty: "No products found.",
            addToCart: "Add to Cart",
            categoryFallback: "Smart Device",
        },

        ar: {
            eyebrow: "متجر أنيس فون",
            title: "جميع المنتجات",
            back: "رجوع",
            all: "الكل",
            bestsellers: "الأكثر مبيعاً",
            new: "الواصل حديثاً",
            deals: "أفضل العروض",
            categories: "الفئات",
            loading: "جاري تحميل المنتجات...",
            empty: "لا توجد منتجات.",
            addToCart: "إضافة للسلة",
            categoryFallback: "جهاز ذكي",
        },
    };

    const current = isArabic
        ? content.ar
        : content.en;

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/products?limit=100`
            );

            if (!response.ok) {
                throw new Error("Failed to load products");
            }

            const result = await response.json();

            setProducts(result.data || []);
        } catch (error) {
            console.error(error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }

    const categories = useMemo(() => {
        const map = new Map();

        products.forEach((product) => {
            if (!product.category_slug) return;

            if (!map.has(product.category_slug)) {
                map.set(product.category_slug, {
                    slug: product.category_slug,
                    name_ar:
                        product.category_name_ar,
                    name_en:
                        product.category_name_en,
                });
            }
        });

        return Array.from(map.values());
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (selectedCategory !== "all") {
            result = result.filter(
                (product) =>
                    product.category_slug ===
                    selectedCategory
            );
        }

        if (activeFilter === "bestsellers") {
            result = result.filter(
                (product) => product.is_featured === true
            );
        }

        if (activeFilter === "new") {
            result.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            );
        }

        if (activeFilter === "deals") {
            result = result.filter((product) => {
                const price = Number(product.price || 0);
                const oldPrice = Number(
                    product.old_price || 0
                );

                return (
                    oldPrice > price ||
                    (Array.isArray(product.offers) &&
                        product.offers.length > 0)
                );
            });
        }

        return result;
    }, [
        products,
        activeFilter,
        selectedCategory,
    ]);

    function getImage(product, index) {
        if (
            Array.isArray(product.images) &&
            product.images.length
        ) {
            const primary =
                product.images.find(
                    (image) => image.is_primary
                );

            return (
                primary?.image_url ||
                product.images[0]?.image_url ||
                fallbackImages[
                index % fallbackImages.length
                ]
            );
        }

        return fallbackImages[
            index % fallbackImages.length
        ];
    }

    function getSpecs(product) {
        const specs = [];

        if (
            Array.isArray(product.variants) &&
            product.variants.length
        ) {
            specs.push(
                isArabic
                    ? product.variants[0].name_ar
                    : product.variants[0].name_en
            );
        }

        if (
            Array.isArray(product.colors) &&
            product.colors.length
        ) {
            specs.push(
                isArabic
                    ? product.colors[0].name_ar
                    : product.colors[0].name_en
            );
        }

        if (product.brand_name_en) {
            specs.push(
                isArabic
                    ? product.brand_name_ar
                    : product.brand_name_en
            );
        }

        return (
            specs.join(" • ") ||
            current.categoryFallback
        );
    }

    function formatPrice(price) {
        return `$${Number(price || 0).toLocaleString()}`;
    }

    function getBadge(product) {
        const price = Number(product.price || 0);
        const oldPrice = Number(
            product.old_price || 0
        );

        if (product.is_featured) {
            return {
                text: isArabic
                    ? "الأكثر مبيعاً"
                    : "Best Seller",
                type: "green",
            };
        }

        if (oldPrice > price) {
            const discount = Math.round(
                ((oldPrice - price) / oldPrice) * 100
            );

            return {
                text: isArabic
                    ? `خصم ${discount}%`
                    : `${discount}% OFF`,
                type: "pink",
            };
        }

        const age =
            (Date.now() -
                new Date(product.created_at).getTime()) /
            (1000 * 60 * 60 * 24);

        if (age <= 30) {
            return {
                text: isArabic ? "جديد" : "New",
                type: "blue",
            };
        }

        if (
            product.inventory_available &&
            Number(product.inventory_quantity) <= 2 &&
            Number(product.inventory_quantity) > 0
        ) {
            return {
                text: isArabic
                    ? `متبقي ${product.inventory_quantity} فقط`
                    : `Only ${product.inventory_quantity} Left`,
                type: "orange",
            };
        }

        return null;
    }

    return (
        <section
            className={`products-page ${isArabic ? "rtl" : "ltr"
                }`}
            dir={isArabic ? "rtl" : "ltr"}
        >
            <div className="products-page-inner">

                {/* HEADER */}

                <div className="products-page-header">

                    <button
                        type="button"
                        className="products-back-button"
                        onClick={onBack}
                    >
                        <ArrowBackIcon />
                        <span>{current.back}</span>
                    </button>

                    <div className="products-page-title">
                        <span>
                            {current.eyebrow}
                        </span>

                        <h1>{current.title}</h1>
                    </div>

                </div>

                {/* FILTERS */}

                <div className="products-page-controls">

                    <div
                        className="products-page-filters"
                        role="tablist"
                    >
                        <button
                            type="button"
                            className={
                                activeFilter === "all"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveFilter("all")
                            }
                        >
                            {current.all}
                        </button>

                        <button
                            type="button"
                            className={
                                activeFilter === "bestsellers"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveFilter(
                                    "bestsellers"
                                )
                            }
                        >
                            {current.bestsellers}
                        </button>

                        <button
                            type="button"
                            className={
                                activeFilter === "new"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveFilter("new")
                            }
                        >
                            {current.new}
                        </button>

                        <button
                            type="button"
                            className={
                                activeFilter === "deals"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveFilter("deals")
                            }
                        >
                            {current.deals}
                        </button>
                    </div>

                    {/* CATEGORIES */}

                    <div className="products-category-filter">

                        <button
                            type="button"
                            className={
                                selectedCategory === "all"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setSelectedCategory("all")
                            }
                        >
                            {current.all}
                        </button>

                        {categories.map((category) => (
                            <button
                                key={category.slug}
                                type="button"
                                className={
                                    selectedCategory ===
                                        category.slug
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setSelectedCategory(
                                        category.slug
                                    )
                                }
                            >
                                {isArabic
                                    ? category.name_ar
                                    : category.name_en}
                            </button>
                        ))}
                    </div>

                </div>

                {/* PRODUCTS */}

                {loading ? (
                    <div className="products-page-grid">
                        {[1, 2, 3, 4].map((item) => (
                            <article
                                key={item}
                                className="products-page-card loading-card"
                                aria-hidden="true"
                            >
                                <div className="products-page-card-top">
                                    <div className="loading-badge" />
                                    <div className="loading-heart" />
                                </div>

                                <div className="products-page-image">
                                    <div className="loading-image" />
                                </div>

                                <div className="products-page-info">
                                    <div className="loading-title" />
                                    <div className="loading-specs" />

                                    <div className="products-page-price">
                                        <div className="loading-price" />
                                    </div>
                                </div>

                                <div className="loading-cart" />
                            </article>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="products-page-empty">
                        {current.empty}
                    </div>
                ) : (
                    <div className="products-page-grid">
                        {filteredProducts.map(
                            (product, index) => {
                                const badge =
                                    getBadge(product);

                                return (
                                    <article
                                        key={product.id}
                                        className="products-page-card"
                                        onClick={() =>
                                            onProductClick?.(
                                                product.id
                                            )
                                        }
                                    >

                                        <div className="products-page-card-top">

                                            {badge && (
                                                <span
                                                    className={`product-badge ${badge.type}`}
                                                >
                                                    {badge.text}
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                className="product-wishlist"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onWishlist?.(
                                                        product.id
                                                    );
                                                }}
                                            >
                                                <HeartIcon />
                                            </button>

                                        </div>

                                        <div className="products-page-image">
                                            <img
                                                src={getImage(
                                                    product,
                                                    index
                                                )}
                                                alt={
                                                    isArabic
                                                        ? product.name_ar
                                                        : product.name_en
                                                }
                                            />
                                        </div>

                                        <div className="products-page-info">

                                            <h3>
                                                {isArabic
                                                    ? product.name_ar
                                                    : product.name_en}
                                            </h3>

                                            <p>
                                                {getSpecs(product)}
                                            </p>

                                            <div className="products-page-price">

                                                <span>
                                                    {formatPrice(
                                                        product.price
                                                    )}
                                                </span>

                                                {Number(
                                                    product.old_price
                                                ) >
                                                    Number(
                                                        product.price
                                                    ) && (
                                                        <del>
                                                            {formatPrice(
                                                                product.old_price
                                                            )}
                                                        </del>
                                                    )}

                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            className="add-cart-button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                onAddToCart?.(
                                                    product.id
                                                );
                                            }}
                                        >
                                            <CartIcon />

                                            <span>
                                                {current.addToCart}
                                            </span>
                                        </button>

                                    </article>
                                );
                            }
                        )}
                    </div>
                )}

            </div>
        </section>
    );
}

/* ========================================
   ICONS
======================================== */

function HeartIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M20.5 8.8c0 5-8.5 10.3-8.5 10.3S3.5 13.8 3.5 8.8A4.3 4.3 0 0 1 12 6.4a4.3 4.3 0 0 1 8.5 2.4Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function CartIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M4 5h2l1.6 9.2a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 1.9-1.4L21 8H7"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            <circle
                cx="10"
                cy="19"
                r="1.3"
                fill="currentColor"
            />

            <circle
                cx="18"
                cy="19"
                r="1.3"
                fill="currentColor"
            />
        </svg>
    );
}

function ArrowBackIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M19 12H5M10 7l-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}