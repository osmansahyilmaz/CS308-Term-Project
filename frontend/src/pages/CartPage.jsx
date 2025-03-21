// src/pages/CartPage.jsx

import React, { useEffect, useState } from "react";
import styles from "./CartPage.module.css";
import LeftPanel from "../components/LeftPanel";
import { Link } from "react-router-dom";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Calculate total (price * quantity)
  const total = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  // Removes an item from the cart
  const handleRemoveItem = (index) => {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  return (
    <div className={styles.cartContainer}>
      {/* Left panel (same style as other pages) */}
      <div className={styles.leftWrapper}>
        <LeftPanel
          bottomLinkText="Back to Shop"
          bottomLinkRoute="/shop"
          quote="Keep shopping!"
          subQuote="Your cart is safe here."
        />
      </div>

      {/* Main content area */}
      <div className={styles.mainContent}>
        <h1 className={styles.cartTitle}>Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className={styles.emptyCartMessage}>No items in your cart.</p>
        ) : (
          <div className={styles.cartTable}>
            {/* List each cart item */}
            {cartItems.map((item, idx) => (
              <div className={styles.cartItem} key={idx}>
                {/* Product image */}
                <div className={styles.itemImageWrapper}>
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className={styles.itemImage}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>No Image</div>
                  )}
                </div>

                {/* Details (name, price, quantity, etc.) */}
                <div className={styles.itemDetails}>
                  <h2 className={styles.itemName}>{item.name}</h2>
                  <p className={styles.itemPrice}>
                    ${item.price.toFixed(2)}
                  </p>
                  <p className={styles.itemQuantity}>
                    Quantity: {item.quantity || 1}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveItem(idx)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Cart summary with total */}
            <div className={styles.cartSummary}>
              <h2 className={styles.summaryTitle}>Cart Summary</h2>
              <p className={styles.summaryTotal}>
                Total: <span>${total.toFixed(2)}</span>
              </p>

              {/* Link to checkout (or wherever your checkout page is) */}
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
