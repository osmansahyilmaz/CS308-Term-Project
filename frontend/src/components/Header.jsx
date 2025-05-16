"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import ThemeToggle from "./ThemeToggle"
import styles from "./Header.module.css"
import { useAuth } from "../context/AuthContext"

const Header = () => {
  const { isAuthenticated, currentUser, userRole, logout } = useAuth();
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showManagementMenu, setShowManagementMenu] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Get cart item count from localStorage
    const getCartCount = () => {
      const cartString = localStorage.getItem("cart")
      if (cartString) {
        const cart = JSON.parse(cartString)
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
        setCartItemCount(count)
      }
    }

    // Handle scroll for header styling
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    getCartCount()
    window.addEventListener("scroll", handleScroll)

    // Set up interval to periodically check cart count (for updates from other components)
    const interval = setInterval(getCartCount, 1000)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearInterval(interval)
    }
  }, [])

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate("/login");
    }
  }

  // Check if user is product manager or sales manager
  const isProductManager = userRole === 'productManager' || userRole === 'admin';
  const isSalesManager = userRole === 'salesManager' || userRole === 'admin';
  const hasManagementAccess = isProductManager || isSalesManager;

  // Toggle management menu
  const toggleManagementMenu = () => {
    setShowManagementMenu(!showManagementMenu);
  }

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoText}>ShopEasy</span>
        </Link>

        <nav className={styles.nav}>
          <Link to="/shop" className={styles.navLink}>
            Shop
          </Link>
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />

          <Link to="/cart" className={styles.cartLink}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartItemCount > 0 && <span className={styles.cartBadge}>{cartItemCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <Link to="/profile" className={styles.profileLink}>
                <span className={styles.username}>{currentUser?.username}</span>
              </Link>
              
              {/* Management dropdown for appropriate roles */}
              {hasManagementAccess && (
                <div className={styles.managementMenu}>
                  <button 
                    className={styles.managementButton} 
                    onClick={toggleManagementMenu}
                  >
                    Management
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  
                  {showManagementMenu && (
                    <div className={styles.dropdownMenu}>
                      {isProductManager && (
                        <>
                          <Link to="/product-management" className={styles.dropdownItem}>
                            Product Management
                          </Link>
                          <Link to="/delivery-management" className={styles.dropdownItem}>
                            Delivery Management
                          </Link>
                        </>
                      )}
                      
                      {isSalesManager && (
                        <Link to="/sales-management" className={styles.dropdownItem}>
                          Sales Management
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className={styles.authLink}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
