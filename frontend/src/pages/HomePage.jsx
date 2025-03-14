// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';
import LeftPanel from '../components/LeftPanel';

function HomePage() {
    return (
        <div className={styles.homeContainer}>
            <div className={styles.leftWrapper}>
                <LeftPanel
                    bottomLinkText="Login"
                    bottomLinkRoute="/login"
                    quote="Discover endless possibilities at your fingertips."
                    subQuote="Unbeatable offers and trends every day."
                />
            </div>
            <div className={styles.rightPanel}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>Welcome to ShopEasy</h1>
                    <p className={styles.subtitle}>
                        Your one-stop shop for all things trendy and unique.
                    </p>
                    <div className={styles.buttons}>
                        <Link to="/product" className={styles.buttonLink}>
                            <button className={styles.primaryButton}>Shop Now</button>
                        </Link>
                        <Link to="/register" className={styles.buttonLink}>
                            <button className={styles.secondaryButton}>Create Account</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
