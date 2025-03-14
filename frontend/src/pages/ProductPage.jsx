import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './ProductPage.module.css';
import { FaHeart, FaShippingFast, FaCheck, FaStar, FaStarHalf, FaRegStar, FaShare } from 'react-icons/fa'; 
import { IoMdAdd, IoMdRemove } from 'react-icons/io';

// Mock product data - this would be replaced with an API call in the future
const mockProduct = {
    id: 1,
    name: 'Geometric Statement Earrings',
    rating: 4.7,
    reviewsCount: 45,
    images: [
        'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1599458349289-d9d1a1ae4a46?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598560917807-1bae44bd2be8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    ],
    price: 93.55,
    originalPrice: 124.73,
    discount: 25, // 25% off
    stock: 3,
    inCarts: 2,
    shippingEst: { start: 'Mar 26', end: 'Mar 27' },
    returnPolicy: 'Returns & exchanges accepted within 21 days',
    location: 'Ships from Greece',
    description: `
    Make a bold statement with these geometric earrings—perfect for any occasion.
    Combine modern design with timeless elegance. Each piece is meticulously crafted
    to ensure the highest quality and lasting beauty.
    
    Our geometric statement earrings are designed to complement any outfit, from casual
    daywear to elegant evening attire. The lightweight construction ensures comfortable
    wearing throughout the day or night.
  `,
    highlights: [
        'Handmade item',
        'Materials: Silver',
        'Length: 6.0 cm',
        'Weight: 14.0 g',
        'Location: Earlobe',
        'Closure: Push back',
    ],
    finishOptions: ['24K Gold Plated', '925 Silver', 'Rose Gold', 'Platinum'],
    sizeOptions: ['Small', 'Medium', 'Large'],
    categories: ['Jewelry', 'Earrings', 'Statement Pieces'],
    tags: ['boho', 'modern', 'geometric', 'statement', 'elegant'],
    relatedProducts: [
        {
            id: 2,
            name: 'Minimalist Gold Ring',
            price: 67.99,
            image: 'https://images.unsplash.com/photo-1600721391689-2564bb8055de?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            rating: 4.5
        },
        {
            id: 3,
            name: 'Pearl Pendant Necklace',
            price: 85.00,
            image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88328?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            rating: 4.8
        },
        {
            id: 4,
            name: 'Silver Chain Bracelet',
            price: 59.99,
            image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
            rating: 4.3
        }
    ]
};

function ProductPage() {
    // State for selected image and customization options
    const [selectedImage, setSelectedImage] = useState(mockProduct.images[0]);
    const [selectedFinish, setSelectedFinish] = useState(mockProduct.finishOptions[0]);
    const [selectedSize, setSelectedSize] = useState(mockProduct.sizeOptions[0]);
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [isLoading, setIsLoading] = useState(true);

    // Simulating data loading from API
    useEffect(() => {
        // In a real app, this would be an API call
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        
        return () => clearTimeout(timer);
    }, []);

    const handleThumbnailClick = (img) => {
        setSelectedImage(img);
    };

    const handleFinishChange = (e) => {
        setSelectedFinish(e.target.value);
    };
    
    const handleSizeChange = (e) => {
        setSelectedSize(e.target.value);
    };
    
    const incrementQuantity = () => {
        if (quantity < mockProduct.stock) {
            setQuantity(quantity + 1);
        }
    };
    
    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };
    
    const toggleWishlist = () => {
        setIsWishlisted(!isWishlisted);
    };

    // Render star ratings component
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} className={styles.star} />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<FaStarHalf key={i} className={styles.star} />);
            } else {
                stars.push(<FaRegStar key={i} className={styles.star} />);
            }
        }
        
        return stars;
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'description':
                return (
                    <div>
                        <p className={styles.descriptionText}>{mockProduct.description}</p>
                        <h3 className={styles.sectionTitle}>Highlights</h3>
                        <ul className={styles.highlightList}>
                            {mockProduct.highlights.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                        
                        <div className={styles.tagsSection}>
                            <h3 className={styles.sectionTitle}>Tags</h3>
                            <div className={styles.tagsList}>
                                {mockProduct.tags.map((tag, idx) => (
                                    <span key={idx} className={styles.tag}>#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'shipping':
                return (
                    <div className={styles.shippingDetails}>
                        <div className={styles.shippingSection}>
                            <div className={styles.shippingIcon}>
                                <FaShippingFast size={24} />
                            </div>
                            <div>
                                <h3>Shipping Details</h3>
                                <p><strong>Estimated arrival:</strong> {mockProduct.shippingEst.start} - {mockProduct.shippingEst.end}</p>
                                <p><strong>Ships from:</strong> {mockProduct.location}</p>
                                <p>Shipping costs may vary based on location. Please proceed to checkout for final calculation.</p>
                            </div>
                        </div>
                        
                        <div className={styles.returnSection}>
                            <div className={styles.returnIcon}>
                                <FaCheck size={24} />
                            </div>
                            <div>
                                <h3>Returns & Exchanges</h3>
                                <p><strong>Return policy:</strong> {mockProduct.returnPolicy}</p>
                                <p>We want you to be completely satisfied with your purchase. If for any reason you're not happy, we're here to help.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'reviews':
                return (
                    <div className={styles.reviewsContainer}>
                        <div className={styles.reviewsSummary}>
                            <div className={styles.averageRating}>
                                <h2>{mockProduct.rating}</h2>
                                <div className={styles.starsLarge}>
                                    {renderStars(mockProduct.rating)}
                                </div>
                                <p>{mockProduct.reviewsCount} reviews</p>
                            </div>
                            
                            <div className={styles.ratingBars}>
                                {[5, 4, 3, 2, 1].map(rating => (
                                    <div key={rating} className={styles.ratingBar}>
                                        <span>{rating} stars</span>
                                        <div className={styles.barContainer}>
                                            <div 
                                                className={styles.barFill} 
                                                style={{ 
                                                    width: `${Math.random() * 100}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <button className={styles.writeReviewBtn}>Write a Review</button>
                        
                        <p className={styles.placeholder}>
                            (Placeholder) Here you will see all customer reviews. This section will be connected to the backend review system.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className={styles.pageContainer}>
                <Header />
                <div className={styles.loadingContainer}>
                    <div className={styles.loader}></div>
                    <p>Loading product information...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Top Navigation */}
            <Header />
            
            {/* Breadcrumb Navigation */}
            <div className={styles.breadcrumbs}>
                <span>Home</span> &gt; <span>{mockProduct.categories[0]}</span> &gt; <span>{mockProduct.categories[1]}</span> &gt; <span className={styles.currentPage}>{mockProduct.name}</span>
            </div>

            {/* Main Content */}
            <div className={styles.productLayout}>
                {/* Left: Image Gallery */}
                <div className={styles.gallerySection}>
                    <div className={styles.largeImageWrapper}>
                        <img src={selectedImage} alt={mockProduct.name} className={styles.largeImage} />
                        <button className={`${styles.wishlistButton} ${isWishlisted ? styles.wishlisted : ''}`} onClick={toggleWishlist}>
                            <FaHeart />
                        </button>
                        <button className={styles.shareButton}>
                            <FaShare />
                        </button>
                    </div>
                    <div className={styles.thumbnails}>
                        {mockProduct.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`${mockProduct.name} view ${idx + 1}`}
                                className={`${styles.thumbnail} ${
                                    selectedImage === img ? styles.selectedThumb : ''
                                }`}
                                onClick={() => handleThumbnailClick(img)}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Product Info */}
                <div className={styles.infoSection}>
                    <h1 className={styles.title}>{mockProduct.name}</h1>

                    {/* Rating & Reviews */}
                    <div className={styles.ratingReviews}>
                        <div className={styles.stars}>
                            {renderStars(mockProduct.rating)}
                        </div>
                        <span className={styles.reviewCount}>
                            {mockProduct.rating} ({mockProduct.reviewsCount} reviews)
                        </span>
                    </div>

                    {/* Pricing */}
                    <div className={styles.pricing}>
                        <span className={styles.currentPrice}>${mockProduct.price.toFixed(2)}</span>
                        <span className={styles.originalPrice}>${mockProduct.originalPrice.toFixed(2)}</span>
                        <span className={styles.discount}>{mockProduct.discount}% OFF</span>
                    </div>

                    {/* Stock info */}
                    <div className={styles.stockInfo}>
                        <span className={styles.stockStatus}>
                            {mockProduct.stock > 0 ? (
                                <>
                                    <span className={styles.inStock}>In Stock</span> - 
                                    Only <strong>{mockProduct.stock}</strong> left
                                </>
                            ) : (
                                <span className={styles.outOfStock}>Out of Stock</span>
                            )}
                        </span>
                        {mockProduct.inCarts > 0 && (
                            <span className={styles.inCarts}>
                                <strong>{mockProduct.inCarts}</strong> people have this in their cart
                            </span>
                        )}
                    </div>

                    {/* Product Customization */}
                    <div className={styles.customizationSection}>
                        {/* Finish Selector */}
                        <div className={styles.selectorContainer}>
                            <label htmlFor="finish">Finish: </label>
                            <select 
                                id="finish" 
                                value={selectedFinish} 
                                onChange={handleFinishChange}
                                className={styles.selector}
                            >
                                {mockProduct.finishOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>

                        {/* Size Selector */}
                        <div className={styles.selectorContainer}>
                            <label htmlFor="size">Size: </label>
                            <select 
                                id="size" 
                                value={selectedSize} 
                                onChange={handleSizeChange}
                                className={styles.selector}
                            >
                                {mockProduct.sizeOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Quantity Selector */}
                        <div className={styles.quantitySelector}>
                            <label>Quantity: </label>
                            <div className={styles.quantityControls}>
                                <button 
                                    className={styles.quantityBtn} 
                                    onClick={decrementQuantity}
                                    disabled={quantity <= 1}
                                >
                                    <IoMdRemove />
                                </button>
                                <span className={styles.quantityValue}>{quantity}</span>
                                <button 
                                    className={styles.quantityBtn} 
                                    onClick={incrementQuantity}
                                    disabled={quantity >= mockProduct.stock}
                                >
                                    <IoMdAdd />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actionButtons}>
                        <button className={styles.addToCartButton}>
                            Add to cart - ${(mockProduct.price * quantity).toFixed(2)}
                        </button>
                        <button className={styles.buyNowButton}>
                            Buy Now
                        </button>
                    </div>

                    {/* Shipping Info Card */}
                    <div className={styles.shippingInfoCard}>
                        <div className={styles.shippingHeader}>
                            <FaShippingFast className={styles.shippingIcon} />
                            <h3>Shipping Information</h3>
                        </div>
                        <div className={styles.shippingDetails}>
                            <p><strong>Estimated arrival:</strong> {mockProduct.shippingEst.start} - {mockProduct.shippingEst.end}</p>
                            <p><strong>Return policy:</strong> {mockProduct.returnPolicy}</p>
                            <p><strong>Ships from:</strong> {mockProduct.location}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs for Description, Shipping & Returns, and Reviews */}
            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabButton} ${activeTab === 'description' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('description')}
                >
                    Description
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'shipping' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('shipping')}
                >
                    Shipping & Returns
                </button>
                <button
                    className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Reviews ({mockProduct.reviewsCount})
                </button>
            </div>

            <div className={styles.tabContent}>
                {renderTabContent()}
            </div>
            
            {/* Related Products Section */}
            <div className={styles.relatedProductsSection}>
                <h2 className={styles.sectionTitle}>You May Also Like</h2>
                <div className={styles.relatedProducts}>
                    {mockProduct.relatedProducts.map(product => (
                        <div key={product.id} className={styles.relatedProductCard}>
                            <div className={styles.relatedProductImage}>
                                <img src={product.image} alt={product.name} />
                            </div>
                            <h3 className={styles.relatedProductName}>{product.name}</h3>
                            <div className={styles.relatedProductRating}>
                                {renderStars(product.rating)}
                            </div>
                            <p className={styles.relatedProductPrice}>${product.price.toFixed(2)}</p>
                            <button className={styles.viewProductButton}>View Product</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default ProductPage;
