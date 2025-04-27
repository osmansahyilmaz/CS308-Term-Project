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
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 6; // Show 6 products per page

    const [sortOption, setSortOption] = useState("default"); // New state for sorting option

    const getRemainingStock = (product) => {
        // Get cart from localStorage
        const cartString = localStorage.getItem("cart");
        const cartItems = cartString ? JSON.parse(cartString) : [];
        
        // Find if product is in cart and get its quantity
        const cartItem = cartItems.find((item) => item.product_id === product.product_id);
        const cartQuantity = cartItem ? cartItem.quantity : 0;
        
        return product.in_stock - cartQuantity;
    };
    
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
            
            // Deduplicate products based on product_id
            const uniqueProductMap = new Map();
            data.products.forEach(product => {
              if (!uniqueProductMap.has(product.product_id)) {
                uniqueProductMap.set(product.product_id, product);
              }
            });
            const uniqueProducts = Array.from(uniqueProductMap.values());
            
            setProducts(uniqueProducts); // Use the deduplicated list
            
            // Build a list of unique categories from the *deduplicated* products
            const uniqueCategories = [...new Set(uniqueProducts.map(p => p.category))];
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
    
    // --- Sorting Logic ---
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortOption) {
            case "price-asc":
                return a.price - b.price;
            case "price-desc":
                return b.price - a.price;
            case "alpha-asc":
                return a.name.localeCompare(b.name);
            case "alpha-desc":
                return b.name.localeCompare(a.name);
            case "popularity":
                // Assuming higher rating means more popular; fallback to 0
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                return ratingB - ratingA;
            default:
                return 0;
        }
    });
    // --- End Sorting Logic ---

    // --- Pagination Logic ---
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    // --- End Pagination Logic ---

    const handleCategoryChange = category => {
        setActiveCategory(category);
        setCurrentPage(1); // Reset to first page when category changes
    };

    const handleSearchChange = e => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page when search query changes
    };
    
    const handleSortChange = (e) => {
        setSortOption(e.target.value);
        setCurrentPage(1); // Reset to first page when sort option changes
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigating to product detail
        
        try {
            // 1) Read existing cart from localStorage
            const cartString = localStorage.getItem("cart");
            let cart = cartString ? JSON.parse(cartString) : [];

            // 2) Check if product already in cart
            const itemIndex = cart.findIndex((item) => item.product_id === product.product_id);

            // Check remaining stock
            const remaining = getRemainingStock(product);
            if (remaining <= 0) {
                alert("Cannot add more. Product stock limit reached.");
                return;
            }

            if (itemIndex !== -1) {
                // Increment quantity if within stock
                cart[itemIndex].quantity += 1;
            } else {
                // Add new product with quantity 1
                cart.push({
                    ...product,
                    quantity: 1,
                });
            }

            // 3) Save back to localStorage
            localStorage.setItem("cart", JSON.stringify(cart));

            // 4) Show success message
            alert(`Added ${product.name} to cart!`);
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
                        
                        {/* User profile icon link */}
                        <Link 
                            to="/profile" 
                            style={{ 
                                marginLeft: "1rem", 
                                fontSize: "1.5rem", 
                                textDecoration: "none" 
                            }}
                            aria-label="View profile"
                        >
                            👤
                        </Link>
                        
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
                        currentProducts.map(product => (
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
                                                onClick={(e) => handleAddToCart(e, product)}
                                                disabled={getRemainingStock(product) <= 0}
                                            >
                                                {getRemainingStock(product) <= 0 ? "Out of Stock" : "Add to Cart"}
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
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index + 1}
                                className={`${styles.paginationButton} ${currentPage === index + 1 ? styles.paginationButtonActive : ""}`}
                                onClick={() => setCurrentPage(index + 1)}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}

                {/* Sorting dropdown */}
                <select 
                    value={sortOption} 
                    onChange={handleSortChange}
                    style={{ marginLeft: "1rem", padding: "0.5rem" }}
                    aria-label="Sort products"
                >
                    <option value="default">Sort By</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="popularity">Popularity</option>
                    <option value="alpha-asc">Alphabetical (A-Z)</option>
                    <option value="alpha-desc">Alphabetical (Z-A)</option>
                </select>
            </div>
        </div>
    );
}

export default ShopPage;