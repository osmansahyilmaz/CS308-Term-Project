import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import LeftPanel from '../components/LeftPanel';

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        username: '',
        password: '',
        agreed: false,
        role: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.agreed) {
            setError('You must agree to the Terms & Conditions.');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                setError(data.message || 'Registration failed.');
            } else {
                navigate('/login');
            }
        } catch (err) {
            setError('An error occurred during registration.');
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.leftWrapper}>
                <LeftPanel
                    bottomLinkText="Back to website"
                    bottomLinkRoute="/"
                    quote="Shopping is not just a necessity—it's an adventure in style."
                    subQuote="Join us and explore amazing deals."
                />
            </div>
            <div className={styles.rightPanel}>
                <div className={styles.formWrapper}>
                    <h2 className={styles.formTitle}>Create an account</h2>
                    <p className={styles.subText}>
                        Already have an account?{' '}
                        <Link to="/login" className={styles.loginLink}>
                            Log in
                        </Link>
                    </p>
                    {error && <div className={styles.error}>{error}</div>}
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputRow}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="firstName">First name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="lastName">Last name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Enter your password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* New Registration Type field */}
                        <div className={styles.inputGroup}>
                            <label htmlFor="role">Registration type</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Select an option
                                </option>
                                <option value="customer">Customer</option>
                                <option value="productManager">Product Manager</option>
                                <option value="salesManager">Sales Manager</option>
                            </select>
                        </div>

                        <div className={styles.termsGroup}>
                            <input
                                type="checkbox"
                                id="terms"
                                name="agreed"
                                checked={formData.agreed}
                                onChange={handleChange}
                                required
                            />
                            <label htmlFor="terms">
                                I agree to the <Link to="/terms">Terms &amp; Conditions</Link>
                            </label>
                        </div>

                        <button type="submit" className={styles.submitButton}>
                            Create account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
