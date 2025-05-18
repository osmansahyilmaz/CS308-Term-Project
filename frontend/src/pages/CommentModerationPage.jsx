import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import styles from './CommentModerationPage.module.css';

const CommentModerationPage = () => {
  const [products, setProducts] = useState([]);
  const [productComments, setProductComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  // Check if user is a product manager
  useEffect(() => {
    if (userRole !== 'productManager' && userRole !== 'admin') {
      toast.error("You don't have permission to access this page");
      navigate('/');
    }
  }, [userRole, navigate]);

  // Fetch products and their reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all pending reviews (for product managers)
        const reviewsResponse = await axios.get('http://localhost:5000/api/reviews/pending', {
          withCredentials: true
        });
        
        if (!reviewsResponse.data || !reviewsResponse.data.pendingReviews) {
          throw new Error('Failed to fetch reviews');
        }
        
        // Restructure the reviews data
        const allReviews = reviewsResponse.data.pendingReviews;
        
        // Get unique product IDs from reviews
        const productIdsWithReviews = [...new Set(allReviews.map(review => review.product_id))];
        
        // Initialize reviews object structure by product id
        const reviewsObj = {};
        productIdsWithReviews.forEach(productId => {
          reviewsObj[productId] = allReviews.filter(review => review.product_id === productId);
        });
        
        // Fetch details for each product that has reviews
        const productsWithReviews = [];
        for (const productId of productIdsWithReviews) {
          try {
            const productResponse = await axios.get(`http://localhost:5000/api/products/${productId}`, {
              withCredentials: true
            });
            
            if (productResponse.data && productResponse.data.product) {
              productsWithReviews.push(productResponse.data.product);
            }
          } catch (err) {
            console.error(`Error fetching product ${productId}:`, err);
          }
        }
        
        // Update state with fetched data
        setProducts(productsWithReviews);
        setProductComments(reviewsObj);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load review data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Approve a review
  const handleApprove = async (productId, reviewId) => {
    try {
      // Call the API to approve a review
      const response = await axios.put(
        `http://localhost:5000/api/reviews/${reviewId}/approve`, 
        {}, 
        { withCredentials: true }
      );
      
      if (response.data && response.data.review) {
        // Remove the approved review from display since we only show pending reviews
        setProductComments(prevComments => {
          const updatedComments = { ...prevComments };
          if (updatedComments[productId]) {
            updatedComments[productId] = updatedComments[productId].filter(
              comment => comment.review_id !== reviewId
            );
            
            // If no more reviews for this product, remove it from the list
            if (updatedComments[productId].length === 0) {
              delete updatedComments[productId];
              setProducts(prevProducts => 
                prevProducts.filter(product => product.product_id !== productId)
              );
            }
          }
          return updatedComments;
        });
        
        toast.success('Review approved successfully');
      }
    } catch (err) {
      console.error('Error approving review:', err);
      toast.error(err.response?.data?.error || 'Failed to approve review');
    }
  };

  // Reject a review
  const handleReject = async (productId, reviewId) => {
    try {
      // Call the API to reject a review
      const response = await axios.put(
        `http://localhost:5000/api/reviews/${reviewId}/reject`, 
        {}, 
        { withCredentials: true }
      );
      
      if (response.data && response.data.review) {
        // Remove the rejected review from display since we only show pending reviews
        setProductComments(prevComments => {
          const updatedComments = { ...prevComments };
          if (updatedComments[productId]) {
            updatedComments[productId] = updatedComments[productId].filter(
              comment => comment.review_id !== reviewId
            );
            
            // If no more reviews for this product, remove it from the list
            if (updatedComments[productId].length === 0) {
              delete updatedComments[productId];
              setProducts(prevProducts => 
                prevProducts.filter(product => product.product_id !== productId)
              );
            }
          }
          return updatedComments;
        });
        
        toast.success('Review rejected successfully');
      }
    } catch (err) {
      console.error('Error rejecting review:', err);
      toast.error(err.response?.data?.error || 'Failed to reject review');
    }
  };

  // Delete a review
  const handleDelete = async (productId, reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      // Call the API to delete a review
      await axios.delete(
        `http://localhost:5000/api/reviews/${reviewId}`, 
        { withCredentials: true }
      );
      
      // Update local state to remove the deleted review
      setProductComments(prevComments => {
        const updatedComments = { ...prevComments };
        if (updatedComments[productId]) {
          updatedComments[productId] = updatedComments[productId].filter(
            comment => comment.review_id !== reviewId
          );
          
          // If no more reviews for this product, remove it from the list
          if (updatedComments[productId].length === 0) {
            delete updatedComments[productId];
            setProducts(prevProducts => 
              prevProducts.filter(product => product.product_id !== productId)
            );
          }
        }
        return updatedComments;
      });
      
      toast.success('Review deleted successfully');
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error(err.response?.data?.error || 'Failed to delete review');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render star ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={i <= rating ? styles.starFilled : styles.starEmpty}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // Count total reviews
  const getTotalComments = () => {
    return Object.values(productComments).flat().length;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Review Moderation</h1>
        <div className={styles.loading}>Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ToastContainer />
      <h1 className={styles.title}>Review Moderation</h1>
      
      {error && <div className={styles.errorNotice}>{error}</div>}
      
      <div className={styles.statsContainer}>
        <div className={styles.statBox}>
          <h3>Products</h3>
          <span className={styles.statNumber}>{products.length}</span>
        </div>
        <div className={styles.statBox}>
          <h3>Pending Reviews</h3>
          <span className={styles.statNumber}>{getTotalComments()}</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No products with pending reviews found.</p>
        </div>
      ) : (
        products.map(product => (
          <div key={product.product_id} className={styles.productCard}>
            <div className={styles.productHeader}>
              <div className={styles.productInfo}>
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className={styles.productImage}
                  />
                )}
                <div>
                  <h2 className={styles.productName}>{product.name}</h2>
                  <p className={styles.productPrice}>${parseFloat(product.price).toFixed(2)}</p>
                </div>
              </div>
              <div className={styles.commentsCount}>
                {productComments[product.product_id]?.length || 0} reviews
              </div>
            </div>
            
            <div className={styles.productComments}>
              {!productComments[product.product_id] || productComments[product.product_id].length === 0 ? (
                <div className={styles.emptyComments}>
                  <p>No pending reviews for this product.</p>
                </div>
              ) : (
                <div className={styles.commentsList}>
                  {productComments[product.product_id].map(review => (
                    <div 
                      key={review.review_id} 
                      className={`${styles.commentCard} ${styles.pendingComment}`}
                    >
                      <div className={styles.commentHeader}>
                        <div className={styles.commentUser}>
                          <span className={styles.username}>{review.username || `User ID: ${review.user_id}`}</span>
                          <span className={styles.commentDate}>
                            Posted: {formatDate(review.date)}
                          </span>
                        </div>
                        <div className={styles.commentRating}>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      
                      <div className={styles.commentContent}>
                        {review.title && <h3>{review.title}</h3>}
                        {review.comment}
                      </div>
                      
                      <div className={styles.commentStatus}>
                        <span className={styles.pendingBadge}>
                          Pending Approval
                        </span>
                      </div>
                      
                      <div className={styles.commentActions}>
                        <button 
                          className={`${styles.actionButton} ${styles.approveButton}`}
                          onClick={() => handleApprove(product.product_id, review.review_id)}
                        >
                          Approve
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.rejectButton}`}
                          onClick={() => handleReject(product.product_id, review.review_id)}
                        >
                          Reject
                        </button>
                        <button 
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(product.product_id, review.review_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentModerationPage; 