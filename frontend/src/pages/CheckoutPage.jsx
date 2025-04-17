import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CheckoutPage.module.css';
import axios from 'axios';

function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cart', {
          withCredentials: true,
        });
        setCartItems(response.data);
        const total = response.data.reduce(
          (acc, item) => acc + item.price * (item.quantity || 1),
          0
        );
        setTotalPrice(total);
        setLoading(false);
      } catch (err) {
        setMessage('Cart yüklenemedi.');
        setLoading(false);
      }
    };
    fetchCart();
  }, []);

  const handlePurchase = async () => {
    try {
      const response = await fetch('http://localhost:5000/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cartItems }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Satın alma başarılı!');
        setCartItems([]);
        setTotalPrice(0);
      } else {
        setMessage(result.error || 'Satın alma başarısız');
      }
    } catch (error) {
      setMessage('Bir hata oluştu: ' + error.message);
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading checkout...</p>;

  return (
    <div className={styles.pageBackground}>
      <div className={styles.checkoutContainer}>
        <div className={styles.leftColumn}>
          <h1 className={styles.checkoutTitle}>Checkout</h1>
          {cartItems.map((item) => (
            <div key={item.product_id} className={styles.checkoutItem}>
              <div className={styles.itemImageWrapper}>
                <img src={item.image} alt={item.name} className={styles.itemImage} />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemDetails}>
                  {item.quantity} x {item.price} TL
                </span>
              </div>
            </div>
          ))}
          <h2 className={styles.totalPrice}>
            Total: <span>{totalPrice.toFixed(2)} TL</span>
          </h2>
        </div>

        <div className={styles.rightColumn}>
          <h2 className={styles.paymentTitle}>Payment Info</h2>
          <form className={styles.paymentForm}>
            <div className={styles.inputGroup}>
              <label>Cardholder Name</label>
              <input type="text" placeholder="John Doe" />
            </div>

            <div className={styles.inputGroup}>
              <label>Card Number</label>
              <input type="text" placeholder="**** **** **** 1234" />
            </div>

            <div className={styles.inputRow}>
              <div>
                <label>Expiration</label>
                <input type="text" placeholder="MM/YY" />
              </div>
              <div>
                <label>CVV</label>
                <input type="text" placeholder="123" />
              </div>
            </div>
          </form>

          <div className={styles.buttonGroup}>
            <button className={styles.backButton} onClick={() => navigate('/cart')}>
              ← Back to Cart
            </button>
            <button className={styles.purchaseButton} onClick={handlePurchase}>
              Purchase
            </button>
          </div>

          {message && <p>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

