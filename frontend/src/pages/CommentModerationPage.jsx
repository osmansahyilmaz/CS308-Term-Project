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

  // Fetch products and their comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First fetch all comments to determine which products have comments
        const commentsResponse = await axios.get('http://localhost:5000/api/comments/all', {
          withCredentials: true
        });
        
        if (!commentsResponse.data || !commentsResponse.data.comments) {
          throw new Error('Failed to fetch comments');
        }
        
        const allComments = commentsResponse.data.comments;
        
        // Get unique product IDs from comments
        const productIdsWithComments = [...new Set(allComments.map(comment => comment.product_id))];
        
        // Only fetch products that have comments
        const productsWithComments = [];
        const commentsObj = {};
        
        // Initialize the comments object structure
        productIdsWithComments.forEach(productId => {
          commentsObj[productId] = allComments.filter(comment => comment.product_id === productId);
        });
        
        // Fetch details for each product that has comments
        for (const productId of productIdsWithComments) {
          try {
            const productResponse = await axios.get(`http://localhost:5000/api/products/${productId}`, {
              withCredentials: true
            });
            
            if (productResponse.data && productResponse.data.product) {
              productsWithComments.push(productResponse.data.product);
            }
          } catch (err) {
            console.error(`Error fetching product ${productId}:`, err);
          }
        }
        
        setProducts(productsWithComments);
        setProductComments(commentsObj);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        
        // For demo purposes - Create sample data if API fails
        // REMOVE THIS IN PRODUCTION
        createSampleData();
        
        setError('Failed to load real data. Showing sample data for demonstration.');
      }
    };
    
    // Create sample data for demonstration if API fails
    const createSampleData = () => {
      // Sample products that have user comments
      const sampleProducts = [
        { product_id: 1, name: 'Smartphone X', description: 'Latest model with advanced features', price: 999.99, image: 'https://via.placeholder.com/150' },
        { product_id: 2, name: 'Laptop Pro', description: 'Powerful laptop for professionals', price: 1499.99, image: 'https://via.placeholder.com/150' },
        { product_id: 3, name: 'Wireless Headphones', description: 'Noise cancelling with premium sound', price: 249.99, image: 'https://via.placeholder.com/150' }
      ];
      
      const sampleComments = {
        1: [
          { comment_id: 101, user_id: 5, username: 'john_doe', product_id: 1, comment_text: 'Great smartphone, I love the camera!', rating: 5, created_at: '2023-05-10T14:30:00Z', is_approved: false },
          { comment_id: 102, user_id: 8, username: 'tech_guru', product_id: 1, comment_text: 'Battery life could be better, but overall a good device.', rating: 4, created_at: '2023-05-12T09:15:00Z', is_approved: true }
        ],
        2: [
          { comment_id: 201, user_id: 3, username: 'remote_worker', product_id: 2, comment_text: 'Perfect laptop for working from home. Fast and reliable.', rating: 5, created_at: '2023-05-08T16:45:00Z', is_approved: false },
          { comment_id: 202, user_id: 7, username: 'student2023', product_id: 2, comment_text: 'Bit expensive but worth it for the performance.', rating: 4, created_at: '2023-05-14T11:20:00Z', is_approved: false }
        ],
        3: [
          { comment_id: 301, user_id: 2, username: 'music_lover', product_id: 3, comment_text: 'Amazing sound quality, very comfortable for long usage.', rating: 5, created_at: '2023-05-09T10:00:00Z', is_approved: true }
        ]
      };
      
      setProducts(sampleProducts);
      setProductComments(sampleComments);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const handleApprove = async (productId, commentId) => {
    try {
      // In a real app, call the API to approve a comment
      // await axios.put(`http://localhost:5000/api/comments/${commentId}/approve`, {}, { withCredentials: true });
      
      // For demo: Update local state
      setProductComments(prevComments => {
        const updatedComments = { ...prevComments };
        if (updatedComments[productId]) {
          updatedComments[productId] = updatedComments[productId].map(comment => 
            comment.comment_id === commentId ? { ...comment, is_approved: true } : comment
          );
        }
        return updatedComments;
      });
      
      toast.success('Comment approved successfully');
    } catch (err) {
      console.error('Error approving comment:', err);
      toast.error('Failed to approve comment');
    }
  };

  const handleDisapprove = async (productId, commentId) => {
    try {
      // In a real app, call the API to disapprove a comment
      // await axios.put(`http://localhost:5000/api/comments/${commentId}/disapprove`, {}, { withCredentials: true });
      
      // For demo: Update local state
      setProductComments(prevComments => {
        const updatedComments = { ...prevComments };
        if (updatedComments[productId]) {
          updatedComments[productId] = updatedComments[productId].map(comment => 
            comment.comment_id === commentId ? { ...comment, is_approved: false } : comment
          );
        }
        return updatedComments;
      });
      
      toast.success('Comment disapproved successfully');
    } catch (err) {
      console.error('Error disapproving comment:', err);
      toast.error('Failed to disapprove comment');
    }
  };

  const handleDelete = async (productId, commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      // In a real app, call the API to delete a comment
      // await axios.delete(`http://localhost:5000/api/comments/${commentId}`, { withCredentials: true });
      
      // For demo: Update local state
      setProductComments(prevComments => {
        const updatedComments = { ...prevComments };
        if (updatedComments[productId]) {
          updatedComments[productId] = updatedComments[productId].filter(comment => 
            comment.comment_id !== commentId
          );
        }
        return updatedComments;
      });
      
      toast.success('Comment deleted successfully');
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Failed to delete comment');
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

  // Count total comments and pending comments
  const getTotalComments = () => {
    return Object.values(productComments).flat().length;
  };

  const getPendingComments = () => {
    return Object.values(productComments)
      .flat()
      .filter(comment => !comment.is_approved)
      .length;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Comment Moderation</h1>
        <div className={styles.loading}>Loading comments...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ToastContainer />
      <h1 className={styles.title}>Comment Moderation</h1>
      
      {error && <div className={styles.errorNotice}>{error}</div>}
      
      <div className={styles.statsContainer}>
        <div className={styles.statBox}>
          <h3>Products</h3>
          <span className={styles.statNumber}>{products.length}</span>
        </div>
        <div className={styles.statBox}>
          <h3>Pending Comments</h3>
          <span className={styles.statNumber}>{getPendingComments()}</span>
        </div>
        <div className={styles.statBox}>
          <h3>Total Comments</h3>
          <span className={styles.statNumber}>{getTotalComments()}</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No products found.</p>
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
                {productComments[product.product_id]?.length || 0} comments
              </div>
            </div>
            
            <div className={styles.productComments}>
              {!productComments[product.product_id] || productComments[product.product_id].length === 0 ? (
                <div className={styles.emptyComments}>
                  <p>No comments for this product.</p>
                </div>
              ) : (
                <div className={styles.commentsList}>
                  {productComments[product.product_id].map(comment => (
                    <div 
                      key={comment.comment_id} 
                      className={`${styles.commentCard} ${comment.is_approved ? styles.approvedComment : styles.pendingComment}`}
                    >
                      <div className={styles.commentHeader}>
                        <div className={styles.commentUser}>
                          <span className={styles.username}>{comment.username || `User ID: ${comment.user_id}`}</span>
                          <span className={styles.commentDate}>
                            Posted: {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <div className={styles.commentRating}>
                          {renderStars(comment.rating)}
                        </div>
                      </div>
                      
                      <div className={styles.commentContent}>
                        {comment.comment_text}
                      </div>
                      
                      <div className={styles.commentStatus}>
                        <span className={comment.is_approved ? styles.approvedBadge : styles.pendingBadge}>
                          {comment.is_approved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                      
                      <div className={styles.commentActions}>
                        {!comment.is_approved ? (
                          <button 
                            className={`${styles.actionButton} ${styles.approveButton}`}
                            onClick={() => handleApprove(product.product_id, comment.comment_id)}
                          >
                            Approve
                          </button>
                        ) : (
                          <button 
                            className={`${styles.actionButton} ${styles.disapproveButton}`}
                            onClick={() => handleDisapprove(product.product_id, comment.comment_id)}
                          >
                            Disapprove
                          </button>
                        )}
                        <button 
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          onClick={() => handleDelete(product.product_id, comment.comment_id)}
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