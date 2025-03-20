import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./ShopPage.module.css";
import LeftPanel from "../components/LeftPanel";
// Import mock data functions
import { getAllProducts } from "../mockData/products";

// This component creates a shop page with product grid, search, and filtering
function ShopPage() {
    // State for managing active category filter
    const [activeCategory, setActiveCategory] = useState("All");
    
    // State for search input
    const [searchQuery, setSearchQuery] = useState("");
    
    // State for products from API
    const [products, setProducts] = useState([]);
    
    // State for loading and error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for categories from API
    const [categories, setCategories] = useState(["All"]);
    
    // Fetch products from backend API or mock data
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                
                // In development, use mock data
                // In production, uncomment the API fetch code
                
                /* Production API fetch code:
                const response = await fetch('/api/products');
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                */
                
                // Using mock data for development
                // Simulate API delay
                setTimeout(() => {
                    const data = getAllProducts();
                    setProducts(data);
                    
                    // Extract unique categories from products
                    const uniqueCategories = [...new Set(data.map(product => product.category))];
                    setCategories(["All", ...uniqueCategories]);
                    
                    setLoading(false);
                }, 800); // simulate network delay
                
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, []);

    // Filter products based on active category and search query
    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Handler for category filter change
    const handleCategoryChange = (category) => {
        setActiveCategory(category);
    };

    // Handler for search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };
    
    // Handler for adding product to cart
    const handleAddToCart = async (e, product) => {
        e.preventDefault(); // Prevent navigation to product page
        try {
            // For development/testing - simulate API call
            // In production, uncomment the API fetch code
            
            /* Production API fetch code:
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: 1
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add product to cart');
            }
            */
            
            // Simulate successful API response
            console.log('Added to cart:', product.id);
            
            // Show success message
            alert(`Added ${product.name} to cart!`);
            
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert('Could not add product to cart. Please try again.');
        }
    };

    return (
        <div className={styles.shopContainer}>
            {/* Left sidebar with branding */}
            <div className={styles.leftWrapper}>
                <LeftPanel
                    bottomLinkText="Home"
                    bottomLinkRoute="/"
                    quote="Find your style. Shop with ease."
                    subQuote="Quality products at unbeatable prices."
                />
            </div>
            
            {/* Main content area */}
            <div className={styles.mainContent}>
                {/* Header with title and search */}
                <div className={styles.headerSection}>
                    <h1 className={styles.shopTitle}>Shop Products</h1>
                    
                    {/* Search bar */}
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {/* Search icon could be added here */}
                    </div>
                </div>
                
                {/* Filter section */}
                <div className={styles.filterSection}>
                    <div className={styles.filterHeader}>
                        <h2 className={styles.filterTitle}>Categories</h2>
                    </div>
                    
                    <div className={styles.filterTags}>
                        {categories.map((category) => (
                            <div
                                key={category}
                                className={`${styles.filterTag} ${activeCategory === category ? styles.filterTagActive : ""}`}
                                onClick={() => handleCategoryChange(category)}
                            >
                                {category}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Products grid with loading and error states */}
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
                        filteredProducts.map((product) => (
                            <Link 
                                to={`/product/${product.id}`} 
                                key={product.id} 
                                className={styles.productLink}
                            >
                                <div className={styles.productCard}>
                                    {/* Product image */}
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
                                        <p className={styles.productDescription}>{product.description}</p>
                                        
                                        <div className={styles.productPriceRow}>
                                            <span className={styles.productPrice}>${product.price.toFixed(2)}</span>
                                            <button 
                                                className={styles.addToCartButton}
                                                onClick={(e) => handleAddToCart(e, product)}
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
                
                {/* Pagination section - to be connected to backend pagination */}
                {!loading && !error && products.length > 0 && (
                    <div className={styles.paginationSection}>
                        <button className={`${styles.paginationButton} ${styles.paginationButtonActive}`}>1</button>
                        <button className={styles.paginationButton}>2</button>
                        <button className={styles.paginationButton}>3</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ShopPage;
