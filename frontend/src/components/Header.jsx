import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
    return (
        <header className={styles.header}>
            {/* Logo / Brand */}
            <div className={styles.logo}>
                <Link to="/" className={styles.brandName}>
                    ShopEasy
                </Link>
            </div>

            {/* Categories (placeholder links) */}
            <nav className={styles.navCategories}>
                <Link to="/category/jewelry" className={styles.categoryLink}>Jewelry</Link>
                <Link to="/category/art" className={styles.categoryLink}>Art & Collectibles</Link>
                <Link to="/category/home" className={styles.categoryLink}>Home & Living</Link>
                <Link to="/category/clothing" className={styles.categoryLink}>Clothing</Link>
            </nav>

            {/* Search Bar */}
            <div className={styles.searchBar}>
                <input type="text" placeholder="Search for items or shops" />
                <button>Search</button>
            </div>

            {/* Icons / Links for User & Cart */}
            <div className={styles.headerIcons}>
                <Link to="/login" className={styles.iconLink}>Sign in</Link>
                <Link to="/cart" className={styles.iconLink}>Cart</Link>
            </div>
        </header>
    );
}

export default Header;
