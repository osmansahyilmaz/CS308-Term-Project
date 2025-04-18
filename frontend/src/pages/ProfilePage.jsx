import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ProfilePage.module.css';

// Profile components
import ProfileInfo from '../components/profile/ProfileInfo';
import AddressList from '../components/profile/AddressList';
import PaymentMethods from '../components/profile/PaymentMethods';
import OrderHistory from '../components/profile/OrderHistory';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                // Get profile from backend
                const response = await axios.get('http://localhost:5000/api/auth/profile', {
                    withCredentials: true // Important: this sends the session cookie
                });
                
                if (response.data && response.data.user) {
                    setUserData(response.data.user);
                } else {
                    setError('No user data returned from server');
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                // If not authenticated, redirect to login
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                    return;
                }
                
                setError('Failed to load user profile');
                setIsLoading(false);
            }
        };
        
        fetchUserData();
    }, [navigate]);

    const renderContent = () => {
        if (isLoading) {
            return <div className={styles.loading}>Loading...</div>;
        }

        if (error) {
            return <div className={styles.error}>{error}</div>;
        }

        if (!userData) {
            return <div className={styles.error}>Failed to load user data.</div>;
        }

        switch (activeTab) {
            case 'profile':
                return <ProfileInfo userData={userData} />;
            case 'addresses':
                return <AddressList />;
            case 'payments':
                return <PaymentMethods />;
            case 'orders':
                return <OrderHistory />;
            default:
                return <ProfileInfo userData={userData} />;
        }
    };

    return (
        <div className={styles.profilePage}>
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <h2>My Account</h2>
                    <ul className={styles.navList}>
                        <li 
                            className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            My Profile
                        </li>
                        <li 
                            className={`${styles.navItem} ${activeTab === 'addresses' ? styles.active : ''}`}
                            onClick={() => setActiveTab('addresses')}
                        >
                            My Addresses
                        </li>
                        <li 
                            className={`${styles.navItem} ${activeTab === 'payments' ? styles.active : ''}`}
                            onClick={() => setActiveTab('payments')}
                        >
                            Payment Methods
                        </li>
                        <li 
                            className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            My Orders
                        </li>
                    </ul>
                </div>
                <div className={styles.content}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage; 