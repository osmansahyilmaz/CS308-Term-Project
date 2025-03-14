// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import LeftPanel from '../components/LeftPanel';

function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!username.trim()) {
            newErrors.username = 'Username is required.';
        }
        if (!password) {
            newErrors.password = 'Password is required.';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            console.log('Logging in with:', username, password);
            // Redirect to the product page after a successful login
            navigate('/product');
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.leftWrapper}>
                <LeftPanel
                    bottomLinkText="Back to website"
                    bottomLinkRoute="/"
                    quote="Your style, your way – login and explore."
                    subQuote="Welcome back to unbeatable trends."
                />
            </div>
            <div className={styles.rightPanel}>
                <div className={styles.formWrapper}>
                    <h2 className={styles.formTitle}>Sign In</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            {errors.username && <div className={styles.error}>{errors.username}</div>}
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {errors.password && <div className={styles.error}>{errors.password}</div>}
                        </div>
                        <button type="submit" className={styles.submitButton}>Login</button>
                    </form>
                    <p className={styles.switchText}>
                        Don’t have an account? <Link to="/register" className={styles.link}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
