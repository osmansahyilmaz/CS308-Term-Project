// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';  // CSS Module for styling

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    // Validate form fields
    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
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
            // Simulate a successful login (later replace with real auth endpoint)
            console.log('Logging in with:', email, password);
            navigate('/');  // Redirect to home page on successful login
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.leftPanel}>
                {/* Branding or promotional content can go here */}
                <h1>Your Brand</h1>
            </div>
            <div className={styles.formPanel}>
                <h2>Login</h2>
                <form onSubmit={handleSubmit} noValidate>
                    {/* Email Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="login-email" className={styles.label}>Email:</label>
                        <input
                            id="login-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="you@example.com"
                            required
                        />
                        {errors.email && <div className={styles.error}>{errors.email}</div>}
                    </div>

                    {/* Password Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="login-password" className={styles.label}>Password:</label>
                        <input
                            id="login-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="Enter your password"
                            required
                        />
                        {errors.password && <div className={styles.error}>{errors.password}</div>}
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className={styles.submitButton}>Login</button>
                </form>

                {/* Forgot Password and Sign-up links */}
                <div className={styles.extraOptions}>
                    <Link to="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
                </div>
                <p className={styles.switchPageText}>
                    Don’t have an account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
