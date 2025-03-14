import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import styles from './LoginPage.module.css';
import LeftPanel from '../components/LeftPanel';

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});

    // Basic client-side validation (email and password are required)
    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        }
        if (!password.trim()) {
            newErrors.password = 'Password is required.';
        }
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                // Make an axios POST request to your login endpoint
                const response = await axios.post(
                    'http://localhost:5000/auth/api/login', // <-- Change to your actual login endpoint
                    { email, password }
                );

                // If successful, show success toast and redirect
                toast.success('Login successful!');
                navigate('/');
            } catch (error) {
                // Display server error or a generic error
                const errorMessage = error.response?.data?.error || 'Login failed';
                toast.error(errorMessage);
            }
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
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {errors.email && (
                                <div className={styles.error}>{errors.email}</div>
                            )}
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
                            {errors.password && (
                                <div className={styles.error}>{errors.password}</div>
                            )}
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            Login
                        </button>
                    </form>
                    <p className={styles.switchText}>
                        Don’t have an account?{' '}
                        <Link to="/register" className={styles.link}>
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default LoginPage;
