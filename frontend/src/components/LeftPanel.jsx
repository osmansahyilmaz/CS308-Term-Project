


import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LeftPanel.module.css';

function LeftPanel({ bottomLinkText, bottomLinkRoute, quote, subQuote }) {
    return (
        <div className={styles.leftPanel}>
            <div className={styles.logoContainer}>
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 500 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <g transform="translate(250,50)" dominantBaseline="middle" textAnchor="middle">
                        <text
                        x="0"
                        y="0"
                        fill="#ffffff"
                        fontSize="48"
                        fontFamily="Arial, sans-serif"
                        fontWeight="bold"
                        >
                        ShopEasy
                        </text>
                        {/* Move the cart a reasonable distance to the right of the text */}
                        <g transform="translate(150,0) scale(1.2) translate(-4,-23)">
                        <path
                            d="M0 0 L20 0 L28 40 L-12 40 L-20 15 L0 15"
                            stroke="#ffffff"
                            strokeWidth="2"
                            fill="none"
                        />
                        <circle cx="-10" cy="45" r="4" fill="#ffffff" />
                        <circle cx="10" cy="45" r="4" fill="#ffffff" />
                        </g>
                    </g>
                </svg>
            </div>
            <div className={styles.contentWrapper}>
                <h2 className={styles.quote}>{quote}</h2>
                {subQuote && <p className={styles.subQuote}>{subQuote}</p>}
            </div>
            <div className={styles.bottomLink}>
                <Link to={bottomLinkRoute} className={styles.link}>
                    {bottomLinkText}
                </Link>
            </div>
        </div>
    );
}

export default LeftPanel;




