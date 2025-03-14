import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import styles from './RegisterPage.module.css';
import LeftPanel from '../components/LeftPanel';

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        role_id: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'role_id' ? Number(value) : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Make an axios POST request to your backend
            const response = await axios.post(
                'http://localhost:5000/auth/api/register', // <-- Change to your actual endpoint
                formData
            );

            // If successful, show success toast and redirect to login
            toast.success('Registration successful. Please log in.');
            navigate('/login');
        } catch (error) {
            // If there's an error response from the server, show it
            const errorMessage = error.response?.data?.error || 'Registration failed';
            toast.error(errorMessage);
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
                    <form onSubmit={handleSubmit} className={styles.form}>
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

                        <div className={styles.inputGroup}>
                            <label htmlFor="role_id">Registration type</label>
                            <select
                                id="role_id"
                                name="role_id"
                                value={formData.role_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Select an option
                                </option>
                                <option value="1">Customer</option>
                                <option value="2">Product Manager</option>
                                <option value="3">Sales Manager</option>
                            </select>
                        </div>

                        <button type="submit" className={styles.submitButton}>
                            Create account
                        </button>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default RegisterPage;



