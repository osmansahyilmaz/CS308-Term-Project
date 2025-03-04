// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';  // CSS Module for styling

function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('');  // "Customer", "Product Manager", "Sales Manager"
    const [errors, setErrors] = useState({});

    // Validate form fields
    const validate = () => {
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = 'Name is required.';
        }
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (!password) {
            newErrors.password = 'Password is required.';
        } else if (password.length < 6) {
            newErrors.password = 'Password should be at least 6 characters.';
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.';
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }
        if (!role) {
            newErrors.role = 'Please select a role.';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length === 0) {
            // Simulate registration success (later replace with API call)
            console.log('Registering user:', { name, email, password, role });
            navigate('/login');  // Redirect to login after successful registration
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.leftPanel}>
                {/* Branding or welcome message */}
                <h1>Welcome!</h1>
            </div>
            <div className={styles.formPanel}>
                <h2>Create an Account</h2>
                <form onSubmit={handleSubmit} noValidate>
                    {/* Name Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-name" className={styles.label}>Name:</label>
                        <input
                            id="reg-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                            placeholder="Your full name"
                            required
                        />
                        {errors.name && <div className={styles.error}>{errors.name}</div>}
                    </div>

                    {/* Email Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-email" className={styles.label}>Email:</label>
                        <input
                            id="reg-email"
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
                        <label htmlFor="reg-password" className={styles.label}>Password:</label>
                        <input
                            id="reg-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="Create a password"
                            required
                        />
                        {errors.password && <div className={styles.error}>{errors.password}</div>}
                    </div>

                    {/* Confirm Password Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-confirm-password" className={styles.label}>Confirm Password:</label>
                        <input
                            id="reg-confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={styles.input}
                            placeholder="Re-enter your password"
                            required
                        />
                        {errors.confirmPassword && <div className={styles.error}>{errors.confirmPassword}</div>}
                    </div>

                    {/* Role Selection Field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-role" className={styles.label}>Role:</label>
                        <select
                            id="reg-role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className={styles.select}
                            required
                        >
                            <option value="" disabled>-- Select Role --</option>
                            <option value="Customer">Customer</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="Sales Manager">Sales Manager</option>
                        </select>
                        {errors.role && <div className={styles.error}>{errors.role}</div>}
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className={styles.submitButton}>Sign Up</button>
                </form>

                {/* Link to Login */}
                <p className={styles.switchPageText}>
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;
