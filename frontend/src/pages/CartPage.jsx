import React, { useEffect, useState } from "react";
import styles from "./CartPage.module.css";
import LeftPanel from "../components/LeftPanel";
import { Link } from "react-router-dom";
import axios from "axios";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart items from the backend
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/cart", {
          withCredentials: true,
        });
        setCartItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("Failed to load cart items.");
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Remove an item from the cart
  const handleRemoveItem = async (productId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/cart/remove-all",
        { productId },
        { withCredentials: true }
      );
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product_id !== productId)
      );
    } catch (err) {
      console.error("Error removing item from cart:", err);
      setError("Failed to remove item from cart.");
    }
  };

  // Calculate total (price * quantity)
  const total = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  if (loading) {
    return <p className={styles.loadingMessage}>Loading cart...</p>;
  }

  if (error) {
    return <p className={styles.errorMessage}>{error}</p>;
  }

  return (
    <div className={styles.cartContainer}>
      <div className={styles.leftWrapper}>
        <LeftPanel
          bottomLinkText="Back to Shop"
          bottomLinkRoute="/shop"
          quote="Keep shopping!"
          subQuote="Your cart is safe here."
        />
      </div>

      <div className={styles.mainContent}>
        <h1 className={styles.cartTitle}>Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className={styles.emptyCartMessage}>No items in your cart.</p>
        ) : (
          <div className={styles.cartTable}>
            {cartItems.map((item) => (
              <div className={styles.cartItem} key={item.product_id}>
                <div className={styles.itemImageWrapper}>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>No Image</div>
                  )}
                </div>

                <div className={styles.itemDetails}>
                  <h2 className={styles.itemName}>{item.name}</h2>
                  <p className={styles.itemPrice}>
                    ${Number(item.price).toFixed(2)}
                  </p>
                  <p className={styles.itemQuantity}>
                    Quantity: {item.quantity || 1}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.product_id)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}

            <div className={styles.cartSummary}>
              <h2 className={styles.summaryTitle}>Cart Summary</h2>
              <p className={styles.summaryTotal}>
                Total: <span>${Number(total).toFixed(2)}</span>
              </p>

              <Link to="/checkout" className={styles.checkoutButton}>
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;