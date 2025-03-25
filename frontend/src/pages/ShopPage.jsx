import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // <-- import useNavigate here
import styles from "./ShopPage.module.css";
import LeftPanel from "../components/LeftPanel";
import { getAllProducts } from "../mockData/products";

function ShopPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState(["All"]);

    // For navigating programmatically
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setTimeout(() => {
                    const data = getAllProducts();
                    setProducts(data);
                    const uniqueCategories = [...new Set(data.map((p) => p.category))];
                    setCategories(["All", ...uniqueCategories]);
                    setLoading(false);
                }, 800);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            activeCategory === "All" || product.category === activeCategory;
        const matchesSearch =
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleAddToCart = async (e, product) => {
        e.preventDefault();
        try {
            console.log("Added to cart:", product.id);
            alert(`Added ${product.name} to cart!`);
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert("Could not add product to cart. Please try again.");
        }
    };

    // **** LOGOUT HANDLER ****
    const handleLogout = async () => {
        try {
            const response = await fetch("/api/logout", {
                method: "POST",
                credentials: "include", // ensure cookies/sessions get sent
            });

            if (!response.ok) {
                throw new Error("Logout failed");
            }

            // If successful, navigate to homepage
            navigate("/");
        } catch (error) {
            console.error("Error during logout:", error);
            alert("Logout failed. Please try again.");
        }
    };

    return (
        <div className={styles.shopContainer}>
            <div className={styles.leftWrapper}>
                <LeftPanel
                    bottomLinkText="Home"
                    bottomLinkRoute="/"
                    quote="Find your style. Shop with ease."
                    subQuote="Quality products at unbeatable prices."
                />
            </div>

            <div className={styles.mainContent}>
                <div className={styles.headerSection}>
                    <h1 className={styles.shopTitle}>Shop Products</h1>

                    <div style={{ display: "flex", alignItems: "center" }}>
                        <div className={styles.searchBar}>
                            <input
                                type="text"
                                placeholder="Search products..."
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            {/* Search icon could go here */}
                        </div>

                        {/* Cart icon link */}
                        <Link
                            to="/cart"
                            style={{
                                marginLeft: "1rem",
                                fontSize: "1.5rem",
                                textDecoration: "none",
                            }}
                            aria-label="View cart"
                        >
                            🛒
                        </Link>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            style={{
                                marginLeft: "1rem",
                                padding: "0.5rem 1rem",
                                borderRadius: "4px",
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: "#FF4A00",
                                color: "#fff",
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Filter Section */}
                <div className={styles.filterSection}>
                    <div className={styles.filterHeader}>
                        <h2 className={styles.filterTitle}>Categories</h2>
                    </div>
                    <div className={styles.filterTags}>
                        {categories.map((category) => (
                            <div
                                key={category}
                                className={`${styles.filterTag} ${
                                    activeCategory === category
                                        ? styles.filterTagActive
                                        : ""
                                }`}
                                onClick={() => handleCategoryChange(category)}
                            >
                                {category}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className={styles.productsGrid}>
                    {loading ? (
                        <div className={styles.loadingMessage}>
                            Loading products...
                        </div>
                    ) : error ? (
                        <div className={styles.errorMessage}>
                            <p>Error loading products: {error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className={styles.retryButton}
                            >
                                Retry
                            </button>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <Link
                                to={`/product/${product.id}`}
                                key={product.id}
                                className={styles.productLink}
                            >
                                <div className={styles.productCard}>
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className={styles.productImage}
                                        />
                                    ) : (
                                        <div
                                            className={styles.productImage}
                                            style={{ backgroundColor: "#f0f0f0" }}
                                        />
                                    )}
                                    <div className={styles.productDetails}>
                                        <h3 className={styles.productName}>
                                            {product.name}
                                        </h3>
                                        <p className={styles.productDescription}>
                                            {product.description}
                                        </p>
                                        <div className={styles.productPriceRow}>
                                            <span className={styles.productPrice}>
                                                ${product.price.toFixed(2)}
                                            </span>
                                            <button
                                                className={styles.addToCartButton}
                                                onClick={(e) =>
                                                    handleAddToCart(e, product)
                                                }
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>No products found matching your criteria.</p>
                    )}
                </div>

                {/* Pagination Section */}
                {!loading && !error && products.length > 0 && (
                    <div className={styles.paginationSection}>
                        <button
                            className={`${styles.paginationButton} ${styles.paginationButtonActive}`}
                        >
                            1
                        </button>
                        <button className={styles.paginationButton}>2</button>
                        <button className={styles.paginationButton}>3</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShopPage;
