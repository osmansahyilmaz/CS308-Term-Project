import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './WishlistPage.module.css';

function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API = 'http://localhost:5000/api';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const { data } = await axios.get(`${API}/wishlist`, { withCredentials: true });
        setWishlistItems(data.wishlist);
      } catch (err) {
        setError('Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API}/wishlist/remove/${productId}`, { withCredentials: true });
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) return <p className={styles.message}>Loading wishlist...</p>;
  if (error) return <p className={styles.message}>{error}</p>;

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.title}>My Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <p className={styles.message}>Your wishlist is empty.</p>
      ) : (
        <div className={styles.grid}>
          {wishlistItems.map(item => (
            <div key={item.product_id} className={styles.card}>
              <img src={item.image} alt={item.name} className={styles.image} onClick={() => handleViewProduct(item.product_id)} />
              <h3 className={styles.name}>{item.name}</h3>
              <p className={styles.price}>${item.price}</p>
              <button className={styles.removeBtn} onClick={() => removeFromWishlist(item.product_id)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WishlistPage;