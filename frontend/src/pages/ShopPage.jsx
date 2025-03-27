import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./ShopPage.module.css";
import LeftPanel from "../components/LeftPanel";
//import { getAllProducts } from "../mockData/products";
import axios from "axios"; // Import axios for API calls

function ShopPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState(["All"]);
    /*
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setTimeout(() => {
                    const data = getAllProducts();
                    setProducts(data);
                    const uniqueCategories = [...new Set(data.map(p => p.category))];
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
    */
    useEffect(() => {
        const fetchProducts = async () => {
          try {
            setLoading(true);
            // Fetch products from your backend endpoint
            const response = await fetch("http://localhost:5000/api/products");
            if (!response.ok) {
              throw new Error("Failed to fetch products");
            }
            const data = await response.json();
            setProducts(data.products);
            // Build a list of unique categories from the products
            const uniqueCategories = [...new Set(data.products.map(p => p.category))];
            setCategories(["All", ...uniqueCategories]);
            setLoading(false);
          } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message);
            setLoading(false);
          }
        };
        fetchProducts();
      }, []);

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
    
    const handleCategoryChange = category => {
        setActiveCategory(category);
    };

    const handleSearchChange = e => {
        setSearchQuery(e.target.value);
    };
    
    /*
    const handleAddToCart = async (e, product) => {
        e.preventDefault();
        try {
            console.log('Added to cart:', product.id);
            alert(`Added ${product.name} to cart!`);
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert('Could not add product to cart. Please try again.');
        }
    };
    */
    const handleAddToCart = async (e, product) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "http://localhost:5000/api/cart/add",
                { productId: product.product_id, quantity: 1 }, // Send product ID and quantity
                { withCredentials: true } // Include session cookies
            );
    
            if (response.status === 200) {
                alert(`Added ${product.name} to cart!`);
            } else {
                console.error("Failed to add product to cart:", response.data.error);
                alert("Could not add product to cart. Please try again.");
            }
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert("Could not add product to cart. Please try again.");
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

                    {/* 
                      Wrap the search bar and cart icon together in a flex container 
                      so they're side-by-side. 
                    */}
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
                                textDecoration: "none" 
                            }}
                            aria-label="View cart"
                        >
                            🛒
                        </Link>
                    </div>
                </div>

                <div className={styles.filterSection}>
                    <div className={styles.filterHeader}>
                        <h2 className={styles.filterTitle}>Categories</h2>
                    </div>
                    <div className={styles.filterTags}>
                        {categories.map(category => (
                            <div
                                key={category}
                                className={`${styles.filterTag} ${
                                    activeCategory === category ? styles.filterTagActive : ""
                                }`}
                                onClick={() => handleCategoryChange(category)}
                            >
                                {category}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.productsGrid}>
                    {loading ? (
                        <div className={styles.loadingMessage}>Loading products...</div>
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
                        filteredProducts.map(product => (
                            <Link
                                to={`/products/${product.product_id}`}  
                                key={product.product_id}
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
                                        <h3 className={styles.productName}>{product.name}</h3>
                                        <p className={styles.productDescription}>
                                            {product.description}
                                        </p>
                                        <div className={styles.productPriceRow}>
                                            <span className={styles.productPrice}>
                                                ${Number(product.price).toFixed(2)}
                                            </span>
                                            <button
                                                className={styles.addToCartButton}
                                                onClick={e => handleAddToCart(e, product)}
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
