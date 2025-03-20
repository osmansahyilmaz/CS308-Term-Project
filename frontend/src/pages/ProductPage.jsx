import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styles from "./ProductPage.module.css";
import LeftPanel from "../components/LeftPanel";
// Import mock data functions
import { getProductById, getRelatedProducts } from "../mockData/products";

// Component for displaying detailed information about a single product
function ProductPage() {
    // Get product ID from URL parameters
    const { productId } = useParams();
    const navigate = useNavigate();
    
    // State for selected quantity
    const [quantity, setQuantity] = useState(1);
    
    // State for active image in gallery
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    
    // State for active review tab
    const [activeTab, setActiveTab] = useState("description");
    
    // State for product data
    const [product, setProduct] = useState(null);
    
    // State for loading and error
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for related products
    const [relatedProducts, setRelatedProducts] = useState([]);
    
    // Fetch product data based on productId
    useEffect(() => {
        const fetchProductData = async () => {
            try {
                setLoading(true);
                
                // In development, use mock data
                // In production, uncomment the API fetch code
                
                /* Production API fetch code:
                const response = await fetch(`/api/products/${productId}`);
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                
                const data = await response.json();
                */
                
                // Using mock data for development
                // Simulate API delay
                setTimeout(() => {
                    const data = getProductById(productId);
                    
                    if (!data) {
                        throw new Error("Product not found");
                    }
                    
                    setProduct(data);
                    setLoading(false);
                    
                    // Fetch related products using mock data
                    const relatedData = getRelatedProducts(productId);
                    setRelatedProducts(relatedData);
                }, 800); // simulate network delay
                
            } catch (err) {
                console.error("Error fetching product:", err);
                setError(err.message);
                setLoading(false);
            }
        };
        
        /* This function is no longer needed since we're using mock data
        // Fetch related products by category
        const fetchRelatedProducts = async (category) => {
            try {
                // Replace with your actual API endpoint
                const response = await fetch(`/api/products?category=${category}&limit=3`);
                
                if (!response.ok) {
                    throw new Error(`API error fetching related products: ${response.status}`);
                }
                
                const data = await response.json();
                // Filter out the current product and limit to 3
                const filtered = data.filter(item => item.id.toString() !== productId.toString()).slice(0, 3);
                setRelatedProducts(filtered);
                
            } catch (err) {
                console.error("Error fetching related products:", err);
                // Non-critical error, don't set main error state
                setRelatedProducts([]);
            }
        };
        */
        
        fetchProductData();
    }, [productId]);
    
    // Calculate the discounted price
    const discountedPrice = product?.discount 
        ? (product.price - (product.price * product.discount / 100)).toFixed(2) 
        : null;
    
    // Handler for quantity change
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0) {
            setQuantity(value);
        }
    };
    
    // Handler for incrementing quantity
    const incrementQuantity = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };
    
    // Handler for decrementing quantity
    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(prevQuantity => prevQuantity - 1);
        }
    };
    
    // Handler for changing active image
    const handleImageChange = (index) => {
        setActiveImageIndex(index);
    };
    
    // Handler for changing active tab
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    
    // Function to render star rating
    const renderStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return (
            <div className={styles.stars}>
                {/* Full stars */}
                {Array.from({ length: fullStars }).map((_, i) => (
                    <span key={`full-${i}`} className={styles.starFull}>★</span>
                ))}
                
                {/* Half star if needed */}
                {halfStar && <span className={styles.starHalf}>★</span>}
                
                {/* Empty stars */}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <span key={`empty-${i}`} className={styles.starEmpty}>☆</span>
                ))}
            </div>
        );
    };
    
    // Handler for adding to cart
    const handleAddToCart = async () => {
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
                    quantity: quantity
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add product to cart');
            }
            */
            
            // Simulate successful API response
            console.log('Added to cart:', product.id, 'Quantity:', quantity);
            
            // Show success message
            alert(`Added ${product.name} to cart!`);
            
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert('Could not add product to cart. Please try again.');
        }
    };
    
    // Handler for buy now
    const handleBuyNow = async () => {
        try {
            // For development/testing - simulate API call
            // In production, uncomment the API fetch code
            
            /* Production API fetch code:
            // First add to cart
            const cartResponse = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: product.id,
                    quantity: quantity
                })
            });
            
            if (!cartResponse.ok) {
                throw new Error('Failed to add product to cart');
            }
            */
            
            // Simulate successful API response
            console.log('Buy now - added to cart:', product.id, 'Quantity:', quantity);
            
            // Then navigate to checkout
            navigate('/checkout');
            
        } catch (err) {
            console.error("Error processing buy now:", err);
            alert('Could not process your order. Please try again.');
        }
    };
    
    // Show loading state
    if (loading) {
        return (
            <div className={styles.productPageContainer}>
                <div className={styles.leftWrapper}>
                    <LeftPanel
                        bottomLinkText="Back to Shop"
                        bottomLinkRoute="/shop"
                        quote="Quality craftsmanship in every detail."
                        subQuote="Explore our premium collection."
                    />
                </div>
                <div className={styles.mainContent}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingMessage}>Loading product details...</div>
                    </div>
                </div>
            </div>
        );
    }
    
    // Show error state
    if (error || !product) {
        return (
            <div className={styles.productPageContainer}>
                <div className={styles.leftWrapper}>
                    <LeftPanel
                        bottomLinkText="Back to Shop"
                        bottomLinkRoute="/shop"
                        quote="Quality craftsmanship in every detail."
                        subQuote="Explore our premium collection."
                    />
                </div>
                <div className={styles.mainContent}>
                    <div className={styles.errorContainer}>
                        <div className={styles.errorMessage}>
                            <p>Error loading product: {error || "Product not found"}</p>
                            <div className={styles.errorActions}>
                                <button 
                                    onClick={() => window.location.reload()} 
                                    className={styles.retryButton}
                                >
                                    Retry
                                </button>
                                <Link to="/shop" className={styles.backToShopLink}>
                                    Back to Shop
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className={styles.productPageContainer}>
            {/* Left sidebar with branding */}
            <div className={styles.leftWrapper}>
                <LeftPanel
                    bottomLinkText="Back to Shop"
                    bottomLinkRoute="/shop"
                    quote="Quality craftsmanship in every detail."
                    subQuote="Explore our premium collection."
                />
            </div>
            
            {/* Main content area */}
            <div className={styles.mainContent}>
                {/* Breadcrumb navigation */}
                <div className={styles.breadcrumbs}>
                    <Link to="/" className={styles.breadcrumbLink}>Home</Link>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <Link to="/shop" className={styles.breadcrumbLink}>Shop</Link>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <span className={styles.breadcrumbCurrent}>{product.name}</span>
                </div>
                
                {/* Product overview section */}
                <div className={styles.productOverview}>
                    {/* Product image gallery */}
                    <div className={styles.productGallery}>
                        <div className={styles.mainImage}>
                            {product.images && product.images.length > 0 ? (
                                <img 
                                    src={product.images[activeImageIndex]} 
                                    alt={product.name} 
                                    className={styles.productMainImage}
                                />
                            ) : (
                                <div 
                                    className={styles.imagePlaceholder}
                                    style={{ backgroundColor: "#e0e0e0" }}
                                >
                                    <span>No Image Available</span>
                                </div>
                            )}
                        </div>
                        
                        {product.images && product.images.length > 1 && (
                            <div className={styles.thumbnailsRow}>
                                {product.images.map((image, index) => (
                                    <div 
                                        key={index}
                                        className={`${styles.thumbnail} ${index === activeImageIndex ? styles.activeThumbnail : ''}`}
                                        onClick={() => handleImageChange(index)}
                                    >
                                        <img 
                                            src={image} 
                                            alt={`${product.name} - view ${index + 1}`} 
                                            className={styles.thumbnailImage} 
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* Product details */}
                    <div className={styles.productDetails}>
                        <h1 className={styles.productName}>{product.name}</h1>
                        
                        <div className={styles.productMeta}>
                            <div className={styles.ratingRow}>
                                {renderStarRating(product.rating || 0)}
                                <span className={styles.reviewCount}>
                                    {product.reviewCount || 0} Reviews
                                </span>
                            </div>
                            
                            <div className={styles.availability}>
                                <span className={product.inStock ? styles.inStock : styles.outOfStock}>
                                    {product.inStock ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>
                        </div>
                        
                        <div className={styles.priceContainer}>
                            {discountedPrice ? (
                                <>
                                    <span className={styles.originalPrice}>${product.price.toFixed(2)}</span>
                                    <span className={styles.discountedPrice}>${discountedPrice}</span>
                                    <span className={styles.discountBadge}>{product.discount}% OFF</span>
                                </>
                            ) : (
                                <span className={styles.productPrice}>${product.price.toFixed(2)}</span>
                            )}
                        </div>
                        
                        <div className={styles.shortDescription}>
                            <p>{product.description}</p>
                        </div>
                        
                        {/* Color options */}
                        {product.colors && product.colors.length > 0 && (
                            <div className={styles.colorOptions}>
                                <label className={styles.optionLabel}>Color:</label>
                                <div className={styles.optionValues}>
                                    {product.colors.map((color, index) => (
                                        <button 
                                            key={index} 
                                            className={`${styles.colorButton} ${index === 0 ? styles.activeColorButton : ''}`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Quantity selector */}
                        <div className={styles.quantityContainer}>
                            <label className={styles.optionLabel}>Quantity:</label>
                            <div className={styles.quantitySelector}>
                                <button 
                                    className={styles.quantityButton} 
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <input 
                                    type="number" 
                                    value={quantity} 
                                    onChange={handleQuantityChange}
                                    min="1" 
                                    className={styles.quantityInput}
                                />
                                <button 
                                    className={styles.quantityButton} 
                                    onClick={incrementQuantity}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className={styles.actionButtons}>
                            <button 
                                className={styles.addToCartButton}
                                onClick={handleAddToCart}
                                disabled={!product.inStock}
                            >
                                Add to Cart
                            </button>
                            <button 
                                className={styles.buyNowButton}
                                onClick={handleBuyNow}
                                disabled={!product.inStock}
                            >
                                Buy Now
                            </button>
                            <button className={styles.wishlistButton}>
                                ♡
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Product tabs - Description, Specifications, Reviews */}
                <div className={styles.productTabs}>
                    <div className={styles.tabButtons}>
                        <button 
                            className={`${styles.tabButton} ${activeTab === 'description' ? styles.activeTab : ''}`}
                            onClick={() => handleTabChange('description')}
                        >
                            Description
                        </button>
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <button 
                                className={`${styles.tabButton} ${activeTab === 'specifications' ? styles.activeTab : ''}`}
                                onClick={() => handleTabChange('specifications')}
                            >
                                Specifications
                            </button>
                        )}
                        <button 
                            className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
                            onClick={() => handleTabChange('reviews')}
                        >
                            Reviews ({product.reviews?.length || 0})
                        </button>
                    </div>
                    
                    <div className={styles.tabContent}>
                        {/* Description Tab */}
                        {activeTab === 'description' && (
                            <div className={styles.descriptionContent}>
                                <p>{product.description}</p>
                                {product.features && product.features.length > 0 && (
                                    <>
                                        <h3 className={styles.featuresTitle}>Key Features</h3>
                                        <ul className={styles.featuresList}>
                                            {product.features.map((feature, index) => (
                                                <li key={index} className={styles.featureItem}>{feature}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {/* Specifications Tab */}
                        {activeTab === 'specifications' && product.specifications && (
                            <div className={styles.specificationsContent}>
                                <table className={styles.specificationsTable}>
                                    <tbody>
                                        {Object.entries(product.specifications).map(([key, value], index) => (
                                            <tr key={index} className={styles.specRow}>
                                                <td className={styles.specName}>{key}</td>
                                                <td className={styles.specValue}>{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        
                        {/* Reviews Tab */}
                        {activeTab === 'reviews' && (
                            <div className={styles.reviewsContent}>
                                <div className={styles.reviewsHeader}>
                                    <div className={styles.reviewsSummary}>
                                        <div className={styles.averageRating}>
                                            <span className={styles.ratingNumber}>{product.rating || 0}</span>
                                            <div className={styles.summaryStars}>
                                                {renderStarRating(product.rating || 0)}
                                            </div>
                                            <span className={styles.totalReviews}>
                                                Based on {product.reviewCount || 0} reviews
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <button className={styles.writeReviewButton}>
                                        Write a Review
                                    </button>
                                </div>
                                
                                <div className={styles.reviewsList}>
                                    {product.reviews && product.reviews.length > 0 ? (
                                        product.reviews.map(review => (
                                            <div key={review.id} className={styles.reviewCard}>
                                                <div className={styles.reviewHeader}>
                                                    <div className={styles.reviewUser}>
                                                        <strong>{review.user}</strong>
                                                        <span className={styles.reviewDate}>{review.date}</span>
                                                    </div>
                                                    <div className={styles.reviewRating}>
                                                        {renderStarRating(review.rating)}
                                                    </div>
                                                </div>
                                                <h4 className={styles.reviewTitle}>{review.title}</h4>
                                                <p className={styles.reviewText}>{review.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className={styles.noReviews}>
                                            No reviews yet. Be the first to review this product!
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Related products section */}
                {relatedProducts.length > 0 && (
                    <div className={styles.relatedProductsSection}>
                        <h2 className={styles.sectionTitle}>You May Also Like</h2>
                        
                        <div className={styles.relatedProductsGrid}>
                            {relatedProducts.map(relatedProduct => (
                                <Link 
                                    to={`/product/${relatedProduct.id}`} 
                                    key={relatedProduct.id} 
                                    className={styles.relatedProductLink}
                                >
                                    <div className={styles.relatedProductCard}>
                                        {/* Product image */}
                                        {relatedProduct.image ? (
                                            <img 
                                                src={relatedProduct.image} 
                                                alt={relatedProduct.name}
                                                className={styles.relatedProductImage}
                                            />
                                        ) : (
                                            <div className={styles.relatedImagePlaceholder}></div>
                                        )}
                                        
                                        <div className={styles.relatedProductDetails}>
                                            <h3 className={styles.relatedProductName}>{relatedProduct.name}</h3>
                                            <span className={styles.relatedProductPrice}>
                                                ${relatedProduct.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductPage; 