"use client"

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"
import styles from "./CartPage.module.css"

function CartPage() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Fetch cart items from localStorage
  useEffect(() => {
    const fetchCart = () => {
      try {
        setLoading(true)
        const cartString = localStorage.getItem("cart")
        const cartData = cartString ? JSON.parse(cartString) : []
        setCartItems(cartData)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching cart:", err)
        setError("Failed to load cart items.")
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  // Remove an item from the cart
  const handleRemoveItem = (productId) => {
    try {
      // Remove item from localStorage
      const cartString = localStorage.getItem("cart")
      const cart = cartString ? JSON.parse(cartString) : []
      const updatedCart = cart.filter((item) => item.product_id !== productId)
      localStorage.setItem("cart", JSON.stringify(updatedCart))

      // Update state
      setCartItems(updatedCart)
    } catch (err) {
      console.error("Error removing item from cart:", err)
      setError("Failed to remove item from cart.")
    }
  }

  // Update item quantity
  const handleUpdateQuantity = (productId, newQuantity) => {
    try {
      if (newQuantity < 1) return

      // Update quantity in localStorage
      const cartString = localStorage.getItem("cart")
      const cart = cartString ? JSON.parse(cartString) : []
      
      const updatedCart = cart.map(item => {
        if (item.product_id === productId) {
          // Check if new quantity exceeds stock
          if (newQuantity > item.in_stock) {
            alert(`Cannot add more than ${item.in_stock} items (available stock).`)
            return { ...item, quantity: item.in_stock }
          }
          return { ...item, quantity: newQuantity }
        }
        return item
      })
      
      localStorage.setItem("cart", JSON.stringify(updatedCart))

      // Update state
      setCartItems(updatedCart)
    } catch (err) {
      console.error("Error updating item quantity:", err)
      setError("Failed to update item quantity.")
    }
  }

  // Handle checkout redirection without requiring auth
  const handleCheckoutClick = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Add items before checking out.")
      return
    }

    try {
      // Check if the user is signed in
      const res = await axios.get("http://localhost:5000/api/auth/profile", { withCredentials: true })
      if (!res.data.user) {
        alert("You need to sign in first to proceed to checkout.")
        navigate("/login", { state: { warning: "Please sign in to proceed to checkout." } })
        return
      }

      // If signed in, navigate to the checkout page
      navigate("/checkout")
    } catch (err) {
      console.error("Error checking signed-in status:", err)
      alert("You need to sign in first to proceed to checkout.")
      navigate("/login", { state: { warning: "Please sign in to proceed to checkout." } })
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const itemPrice = parseFloat(item.price) || 0
      const discount = parseFloat(item.discount) || 0
      const discountedPrice = itemPrice - (itemPrice * discount) / 100
      return acc + discountedPrice * (parseInt(item.quantity) || 1)
    }, 0)
  }

  const calculateTotalDiscount = () => {
    return cartItems.reduce((acc, item) => {
      const itemPrice = parseFloat(item.price) || 0
      const discount = parseFloat(item.discount) || 0
      return acc + ((itemPrice * discount) / 100) * (parseInt(item.quantity) || 1)
    }, 0)
  }

  const calculateItemCount = () => {
    return cartItems.reduce((acc, item) => acc + (parseInt(item.quantity) || 1), 0);
  }

  if (loading) {
    return (
      <div className={styles.cartPage}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p>Loading your cart...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.cartPage}>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.cartHeader}>
            <h1 className={styles.pageTitle}>Shopping Cart</h1>
            {cartItems.length > 0 && (
              <div className={styles.cartInfo}>
                <span>{calculateItemCount()} items in your cart</span>
              </div>
            )}
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIconWrapper}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.emptyCartIcon}
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added any products to your cart yet.</p>
              <Link to="/shop" className={styles.shopButton}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className={styles.cartLayout}>
              <div className={styles.cartItemsContainer}>
                {cartItems.map((item) => {
                  const itemPrice = parseFloat(item.price) || 0
                  const discount = parseFloat(item.discount) || 0
                  const discountedPrice = itemPrice - (itemPrice * discount) / 100
                  const itemTotal = discountedPrice * (parseInt(item.quantity) || 1)

                  return (
                    <div key={item.product_id} className={styles.cartItem}>
                      <div className={styles.itemImageContainer}>
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className={styles.itemImage}
                          />
                        ) : (
                          <div className={styles.imagePlaceholder}>
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              width="24" 
                              height="24" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.itemDetails}>
                        <div className={styles.itemInfo}>
                          <h3 className={styles.itemName}>
                            <Link to={`/products/${item.product_id}`}>{item.name}</Link>
                          </h3>
                          
                          {item.colors && item.colors.length > 0 && (
                            <div className={styles.itemAttributes}>
                              <span className={styles.colorIndicator} style={{ backgroundColor: item.colors[0] }}></span>
                              <span className={styles.colorName}>{item.colors[0]}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className={styles.itemPrice}>
                          {discount > 0 ? (
                            <div className={styles.priceWithDiscount}>
                              <span className={styles.originalPrice}>${itemPrice.toFixed(2)}</span>
                              <span className={styles.discountedPrice}>${discountedPrice.toFixed(2)}</span>
                              <span className={styles.discountBadge}>-{discount}%</span>
                            </div>
                          ) : (
                            <span>${itemPrice.toFixed(2)}</span>
                          )}
                        </div>
                        
                        <div className={styles.quantityAndActions}>
                          <div className={styles.quantityControl}>
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleUpdateQuantity(item.product_id, (parseInt(item.quantity) || 1) - 1)}
                              disabled={(parseInt(item.quantity) || 1) <= 1}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                            <span className={styles.quantityNumber}>{parseInt(item.quantity) || 1}</span>
                            <button
                              className={styles.quantityButton}
                              onClick={() => handleUpdateQuantity(item.product_id, (parseInt(item.quantity) || 1) + 1)}
                              disabled={(parseInt(item.quantity) || 1) >= item.in_stock}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            </button>
                          </div>
                          
                          <button
                            className={styles.removeButton}
                            onClick={() => handleRemoveItem(item.product_id)}
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className={styles.itemTotal}>
                          <span className={styles.itemTotalLabel}>Item Total:</span>
                          <span className={styles.itemTotalValue}>${itemTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={styles.orderSummary}>
                <div className={styles.summaryCard}>
                  <h2 className={styles.summaryTitle}>Order Summary</h2>
                  
                  <div className={styles.summaryContent}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal ({calculateItemCount()} items)</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    
                    {calculateTotalDiscount() > 0 && (
                      <div className={styles.summaryRow}>
                        <span>Discounts</span>
                        <span className={styles.discountValue}>-${calculateTotalDiscount().toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className={styles.summaryRow}>
                      <span>Shipping</span>
                      <span className={styles.freeShipping}>Free</span>
                    </div>
                    
                    <div className={styles.divider}></div>
                    
                    <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                      <span>Order Total</span>
                      <span className={styles.grandTotal}>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button className={styles.checkoutButton} onClick={handleCheckoutClick}>
                    Proceed to Checkout
                  </button>
                  
                  <Link to="/shop" className={styles.continueShopping}>
                    Continue Shopping
                  </Link>
                </div>
                
                <div className={styles.secureCheckout}>
                  <div className={styles.secureIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default CartPage
