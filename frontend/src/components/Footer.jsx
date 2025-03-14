import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest } from 'react-icons/fa';
import styles from './Footer.module.css';

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerLinks}>
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/shipping">Shipping & Returns</Link>
                    <Link to="/faq">FAQ</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms of Service</Link>
                </div>
                
                <div className={styles.socials}>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                        <FaFacebook className={styles.socialIcon} />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                        <FaTwitter className={styles.socialIcon} />
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                        <FaInstagram className={styles.socialIcon} />
                    </a>
                    <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
                        <FaPinterest className={styles.socialIcon} />
                    </a>
                </div>
                
                <div>
                    © {new Date().getFullYear()} ShopEasy. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default Footer;
