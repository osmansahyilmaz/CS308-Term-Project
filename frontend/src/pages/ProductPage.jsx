import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styles from "./ProductPage.module.css";
import LeftPanel from "../components/LeftPanel";
import heartIcon from "../assets/heart.svg";
import heartFilledIcon from "../assets/heart-filled.svg";
import axios from "axios"; // Import axios for API calls

//import { getProductById, getRelatedProducts } from "../mockData/products";


function ProductPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState("description");
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);






    const [isInWishlist, setIsInWishlist] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [bounceClass, setBounceClass] = useState('');





    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [canAddReview, setCanAddReview] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userUsername, setUserUsername] = useState('');


    useEffect(() => {
        const fetchProductData = async () => {
          try {
            setLoading(true);
            // Call backend to get product details
            const response = await fetch(`http://localhost:5000/api/products/${productId}`);
            if (!response.ok) {
              throw new Error("Failed to fetch product details");
            }
            const data = await response.json();
            if (!data.product) {
              throw new Error("Product not found");
            }
            setProduct(data.product);
            setLoading(false);
    
            // Optionally, fetch all products to determine related products (based on same category)
            const resAll = await fetch("http://localhost:5000/api/products");
            if (resAll.ok) {
              const dataAll = await resAll.json();
              const related = dataAll.products.filter(
                p => p.product_id !== data.product.product_id && p.category === data.product.category
              );
              setRelatedProducts(related);
            }
          } catch (err) {
            console.error("Error fetching product:", err);
            setError(err.message);
            setLoading(false);
          }
        };
        fetchProductData();
      }, [productId]);



    //i added this section for whislist - sinem

    useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const found = wishlist.some(p => p.product_id === product?.product_id);
    setIsInWishlist(found);
    }, [product]);


    const handleWishlistToggle = async () => {
        if (!isLoggedIn) {
            alert("Please login to use the wishlist feature.");
            return;
        }

        try {
            let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
            const exists = wishlist.some(p => p.product_id === product.product_id);

            if (exists) {
                wishlist = wishlist.filter(p => p.product_id !== product.product_id);
                await axios.delete(`http://localhost:5000/api/wishlist/remove/${product.product_id}`, {
                    withCredentials: true
                });
            } else {
                wishlist.push(product);
                await axios.post(
                    'http://localhost:5000/api/wishlist/add',
                    { productId: product.product_id },
                    { withCredentials: true }
                );
            }

            localStorage.setItem("wishlist", JSON.stringify(wishlist));

            setBounceClass('heartIconBounce');
            setTimeout(() => setBounceClass(''), 500);

            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);

            setIsInWishlist(!exists);
        } catch (err) {
            console.error("Wishlist toggle error:", err);
            alert("Wishlist operation failed. Please try again.");
        }
    };



    // it ends here


    const discountedPrice = product?.discount
        ? (product.price - (product.price * product.discount) / 100).toFixed(2)
        : null;

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0) {
            setQuantity(value);
        } else if (value > product.in_stock) {
            setQuantity(product.in_stock);
        }
    };

    const incrementQuantity = () => {
        const remaining = getRemainingStock();
        setQuantity(prev => {
            if (prev + 1 > remaining) {
                alert("Cannot add more. Stock limit reached.");
                return prev;
            }
            return prev + 1;
        });
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };

    const handleImageChange = (index) => {
        setActiveImageIndex(index);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const renderStarRating = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <div className={styles.stars}>
                {Array.from({ length: fullStars }).map((_, i) => (
                    <span key={`full-${i}`} className={styles.starFull}>
                        ★
                    </span>
                ))}
                {halfStar && <span className={styles.starHalf}>★</span>}
                {Array.from({ length: emptyStars }).map((_, i) => (
                    <span key={`empty-${i}`} className={styles.starEmpty}>
                        ☆
                    </span>
                ))}
            </div>
        );
    };

    // i added this - sinem
    const checkLoginAndReview = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/auth/profile", {
                withCredentials: true,
            });
            if (res.status === 200 && res.data.user) {
                setIsLoggedIn(true);
                setUserId(res.data.user.id);
                setUserUsername(res.data.user.username);
                await checkReviewEligibility();
            } else {
                setIsLoggedIn(false);
            }
        } catch (err) {
            setIsLoggedIn(false);
        }
    };

    const checkReviewEligibility = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/reviews/can-add/${productId}`, {
                withCredentials: true,
            });
            if (res.status === 200) {
                setCanAddReview(res.data.canAddReview);
                setHasReviewed(res.data.hasReviewed);
            } else {
                setCanAddReview(false);
                setHasReviewed(false);
            }
        } catch (err) {
            console.error("Error checking review eligibility:", err);
            setCanAddReview(false);
            setHasReviewed(false);
        }
    };

    useEffect(() => {
        checkLoginAndReview();
    }, [productId]);

    //


    // Helper to compute remaining stock considering items already in cart
    const getRemainingStock = () => {
        if (!product) return 0;
        const cartString = localStorage.getItem("cart");
        const cartItems = cartString ? JSON.parse(cartString) : [];
        const cartItem = cartItems.find((item) => item.product_id === product.product_id);
        const cartQuantity = cartItem ? cartItem.quantity : 0;
        return product.in_stock - cartQuantity;
    };

    // -- UPDATED HANDLE ADD TO CART --
    const handleAddToCart = async () => {
        try {
            const remaining = getRemainingStock();
            if (quantity > remaining) {
                alert(`Cannot add ${quantity} items. Only ${remaining} left in stock.`);
                return;
            }

            // 1) Read existing cart from localStorage
            const cartString = localStorage.getItem("cart");
            let cart = cartString ? JSON.parse(cartString) : [];

            // 2) Check if product already in cart
            const itemIndex = cart.findIndex((item) => item.product_id === product.product_id);

            if (itemIndex !== -1) {
                cart[itemIndex].quantity += quantity;
            } else {
                cart.push({
                    ...product,
                    quantity: quantity,
                });
            }

            // 3) Save back to localStorage
            localStorage.setItem("cart", JSON.stringify(cart));

            // 4) (Optional) Show a quick success message
            alert(`Added ${product.name} x${quantity} to cart!`);

            // 5) Redirect to /cart so user sees their new item
            navigate("/cart");
        } catch (err) {
            console.error("Error adding to cart:", err);
            alert("Could not add product to cart. Please try again.");
        }
    };
    // -- END UPDATED HANDLE ADD TO CART --

    const handleBuyNow = async () => {
        try {
            if (!product) return;

            const remaining = getRemainingStock();
            if (quantity > remaining) {
                alert(`Cannot buy ${quantity} items. Only ${remaining} left in stock.`);
                return;
            }

            // Build a temporary cart with just this item
            const singleItem = {
                ...product,
                quantity,
            };

            // Navigate to checkout with state carrying buy-now items
            navigate("/checkout", { state: { buyNowItems: [singleItem] } });
        } catch (err) {
            console.error("Error processing buy now:", err);
            alert("Could not process your order. Please try again.");
        }
    };

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
                    <Link to="/" className={styles.breadcrumbLink}>
                        Home
                    </Link>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <Link to="/shop" className={styles.breadcrumbLink}>
                        Shop
                    </Link>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <span className={styles.breadcrumbCurrent}>{product.name}</span>
                </div>

                {/* Product overview section */}
                <div className={styles.productOverview}>
                    {/* Product image gallery */}
                    {showToast && (<div className={styles.toast}>{isInWishlist ? "Added to Wishlist!" : "Removed from Wishlist!"}</div>)}
                    <div className={styles.productGallery}>
                        <div className={styles.wishlistWrapper}>
                            <img
                                src={isInWishlist ? heartFilledIcon : heartIcon}
                                alt="Wishlist"
                                className={`${styles.wishlistIcon} ${bounceClass ? styles[bounceClass] : ''}`}
                                onClick={handleWishlistToggle}
                            />
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
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className={styles.thumbnailsRow}>
                                {product.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.thumbnail} ${
                                            index === activeImageIndex
                                                ? styles.activeThumbnail
                                                : ""
                                        }`}
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
                                    {product.reviews?.length || 0} Reviews
                                </span>
                            </div>

                            <div className={styles.availability}>
                                <span
                                    className={
                                        product.in_stock ? styles.inStock : styles.outOfStock
                                    }
                                >
                                    {product.in_stock ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>
                        </div>

                        <div className={styles.priceContainer}>
                            {discountedPrice ? (
                                <>
                                    <span className={styles.originalPrice}>
                                        ${Number(product.price).toFixed(2)}
                                    </span>
                                    <span className={styles.discountedPrice}>
                                        ${discountedPrice}
                                    </span>
                                    <span className={styles.discountBadge}>
                                        {product.discount}% OFF
                                    </span>
                                </>
                            ) : (
                                <span className={styles.productPrice}>
                                    ${Number(product.price).toFixed(2)}
                                </span>
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
                                            className={`${styles.colorButton} ${
                                                index === 0 ? styles.activeColorButton : ""
                                            }`}
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
                                    disabled={quantity >= product.in_stock}
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
                                disabled={getRemainingStock() <= 0}
                            >
                                {getRemainingStock() <= 0 ? "Out of Stock" : "Add to Cart"}
                            </button>
                            <button
                                className={styles.buyNowButton}
                                onClick={handleBuyNow}
                                disabled={!product.in_stock}
                            >
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product tabs */}
                <div className={styles.productTabs}>
                    <div className={styles.tabButtons}>
                        <button
                            className={`${styles.tabButton} ${
                                activeTab === "description" ? styles.activeTab : ""
                            }`}
                            onClick={() => handleTabChange("description")}
                        >
                            Description
                        </button>
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <button
                                className={`${styles.tabButton} ${
                                    activeTab === "specifications" ? styles.activeTab : ""
                                }`}
                                onClick={() => handleTabChange("specifications")}
                            >
                                Specifications
                            </button>
                        )}
                        <button
                            className={`${styles.tabButton} ${
                                activeTab === "reviews" ? styles.activeTab : ""
                            }`}
                            onClick={() => handleTabChange("reviews")}
                        >
                            Reviews ({product.reviews?.length || 0})
                        </button>
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === "description" && (
                            <div className={styles.descriptionContent}>
                                <p>{product.description}</p>
                                {product.features && product.features.length > 0 && (
                                    <>
                                        <h3 className={styles.featuresTitle}>Key Features</h3>
                                        <ul className={styles.featuresList}>
                                            {product.features.map((feature, index) => (
                                                <li key={index} className={styles.featureItem}>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === "specifications" && product.specifications && (
                            <div className={styles.specificationsContent}>
                                <table className={styles.specificationsTable}>
                                    <tbody>
                                        {Object.entries(product.specifications).map(
                                            ([key, value], index) => (
                                                <tr key={index} className={styles.specRow}>
                                                    <td className={styles.specName}>{key}</td>
                                                    <td className={styles.specValue}>{value}</td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className={styles.reviewsContent}>
                                <div className={styles.reviewsHeader}>
                                    <div className={styles.reviewsSummary}>
                                        <div className={styles.averageRating}>
                                            <span className={styles.ratingNumber}>
                                                {Number(product.rating).toFixed(1) || 0}
                                            </span>
                                            <div className={styles.summaryStars}>
                                                {renderStarRating(product.rating || 0)}
                                            </div>
                                            <span className={styles.totalReviews}>
                                                Based on {product.reviews?.length || 0} reviews
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        className={styles.writeReviewButton}
                                        onClick={() => {
                                            if (!isLoggedIn) {
                                                alert("Please login to write a review.");
                                            } else if (hasReviewed) {
                                                alert("You have already reviewed this product.");
                                            } else if (!canAddReview) {
                                                alert("You can only review products you've purchased and received.");
                                            } else {
                                                setShowReviewModal(true);
                                            }
                                        }}
                                    >
                                        Write a Review
                                    </button>
                                </div>

                                <div className={styles.reviewsList}>
                                
                                    {product.reviews && product.reviews.length > 0 ? (

                                       //console.log("product.reviews:", product.reviews),
                                        product.reviews.map((review) => (
                                            <div key={review.id} className={styles.reviewCard}>
                                                <div className={styles.reviewHeader}>
                                                    <div className={styles.reviewUser}>
                                                        <strong>{review.user}</strong>
                                                        <span className={styles.reviewDate}>
                                                            {review.date}
                                                        </span>
                                                    </div>
                                                    <div className={styles.reviewRating}>
                                                        {renderStarRating(review.rating)}
                                                    </div>
                                                </div>
                                                <h4 className={styles.reviewTitle}>
                                                    {review.title}
                                                </h4>
                                                <p className={styles.reviewText}>
                                                    {review.comment}
                                                </p>

                    

                                                {review.user === userUsername && (
                                                    <button
                                                        className={styles.deleteReviewButton}
                                                        onClick={async () => {
                                                            try {
                                                                await axios.delete(
                                                                    `http://localhost:5000/api/reviews/${review.id}`,
                                                                    { withCredentials: true }
                                                                );
                                                                alert('Review deleted!');
                                                                window.location.reload();
                                                            } catch (err) {
                                                                console.error('Delete failed:', err);
                                                                alert('Failed to delete review.');
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
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

                {showReviewModal && (
                    <div className={styles.reviewModal}>
                        <div className={styles.modalContent}>
                        <h3>Write a Review</h3>

                        <label>Title:</label>
                        <input
                            type="text"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            placeholder="Enter review title"
                        />

                        <label>Rating (1-5):</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                        />

                        <label>Comment:</label>
                        <textarea
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Write your review..."
                        />

                        <div className={styles.modalButtons}>
                            <button onClick={async () => {
                                try {
                                    await axios.post(
                                        'http://localhost:5000/api/reviews',
                                        {
                                            productId: product.product_id,
                                            title: reviewTitle,
                                            comment: reviewComment,
                                            rating: reviewRating,
                                        },
                                        { withCredentials: true }
                                    );
                                    alert("Review submitted!");
                                    setShowReviewModal(false);
                                    setReviewTitle('');
                                    setReviewComment('');
                                    setReviewRating(5);

                                    // Re-fetch product details to update reviews and average rating
                                    const response = await fetch(`http://localhost:5000/api/products/${productId}`);
                                    if (response.ok) {
                                        const data = await response.json();
                                        setProduct(data.product);
                                    }
                                } catch (err) {
                                    console.error("Review submit error:", err);
                                    alert("Failed to submit review. Please try again.");
                                }
                            }}>
                                Submit
                            </button>

                            <button onClick={() => setShowReviewModal(false)}>Cancel</button>
                        </div>
                        </div>
                    </div>
                )}

                {/* Related products */}
                {relatedProducts.length > 0 && (
                    <div className={styles.relatedProductsSection}>
                        <h2 className={styles.sectionTitle}>You May Also Like</h2>
                        <div className={styles.relatedProductsGrid}>
                            {relatedProducts.map((relatedProduct) => (
                                <Link
                                    to={`/products/${relatedProduct.product_id}`}
                                    key={relatedProduct.product_id}
                                    className={styles.relatedProductLink}
                                >
                                    <div className={styles.relatedProductCard}>
                                        {relatedProduct.image ? (
                                            <img
                                                src={relatedProduct.image}
                                                alt={relatedProduct.name}
                                                className={styles.relatedProductImage}
                                            />
                                        ) : (
                                            <div
                                                className={styles.relatedImagePlaceholder}
                                            ></div>
                                        )}
                                        <div className={styles.relatedProductDetails}>
                                            <h3 className={styles.relatedProductName}>
                                                {relatedProduct.name}
                                            </h3>
                                            <span className={styles.relatedProductPrice}>
                                                ${Number(relatedProduct.price).toFixed(2)}
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

