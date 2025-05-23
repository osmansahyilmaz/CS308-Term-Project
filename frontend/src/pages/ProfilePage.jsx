import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ProfilePage.module.css';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Profile components
import ProfileInfo from '../components/profile/ProfileInfo';
import AddressList from '../components/profile/AddressList';
import PaymentMethods from '../components/profile/PaymentMethods';
import OrderHistory from '../components/profile/OrderHistory';
import RefundDashboard from './RefundDashboard';

const ProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { userRole, currentUser } = useAuth();

    // Debug user role issue
    console.log('Current user role from context:', userRole);
    console.log('Current user data:', currentUser);
    
    // Using proper role strings now that we have mapped role_id to role string
    const isProductManager = userRole === 'productManager' || userRole === 'admin';
    const isSalesManager = userRole === 'salesManager' || userRole === 'admin';
    const hasManagementAccess = isProductManager || isSalesManager;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                // Get profile from backend
                const response = await axios.get('http://localhost:5000/api/auth/profile', {
                    withCredentials: true
                });
                
                if (response.data && response.data.user) {
                    setUserData(response.data.user);
                    console.log('User data from API:', response.data.user);
                    // Debug user role
                    console.log('Role ID from API response:', response.data.user.role_id);
                } else {
                    setError('No user data returned from server');
                }
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
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
            case 'refundDashboard':
                return <RefundDashboard />;
            default:
                return <ProfileInfo userData={userData} />;
        }
    };

    // Function to handle navigation to management pages with permission checks
    const handleManagementClick = (page) => {
        console.log(`Attempting to navigate to ${page}`);
        console.log(`User role: ${userRole}`);
        console.log(`isProductManager: ${isProductManager}, isSalesManager: ${isSalesManager}`);
        
        // Check permissions before navigation
        switch(page) {
            case 'productManagement':
                if (isProductManager) {
                    console.log('Navigating to product management');
                    navigate('/product-management');
                } else {
                    toast.error("You don't have permission to access Product Management.");
                }
                break;
            case 'deliveryManagement':
                if (isProductManager) {
                    console.log('Navigating to delivery management');
                    navigate('/delivery-management');
                } else {
                    toast.error("You don't have permission to access Delivery Management.");
                }
                break;
            case 'commentModeration':
                if (isProductManager) {
                    console.log('Navigating to comment moderation');
                    navigate('/comment-moderation');
                } else {
                    toast.error("You don't have permission to access Comment Moderation.");
                }
                break;
            case 'salesManagement':
                if (isSalesManager) {
                    console.log('Navigating to sales management');
                    navigate('/sales-management');
                } else {
                    toast.error("You don't have permission to access Sales Management.");
                }
                break;
            case 'refundDashboard':
                if (isSalesManager) {
                    console.log('Navigating to refund dashboard');
                    navigate('/refund-dashboard');
                } else {
                    toast.error("You don't have permission to access the Refund Dashboard.");
                }
                break;
            default:
                break;
        }
    };

    return (
        <div className={styles.profilePage}>
            <ToastContainer position="top-center" autoClose={3000} />
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
                        
                        {/* Show management section if user has any management role */}
                        {hasManagementAccess && (
                            <>
                                <li className={styles.sectionDivider}>Management</li>
                                
                                <li 
                                    className={`${styles.navItem} ${!isProductManager ? styles.disabledLink : ''}`}
                                    onClick={() => handleManagementClick('productManagement')}
                                >
                                    Product Management
                                    {!isProductManager && <span className={styles.noAccessIcon}>🔒</span>}
                                </li>
                                <li 
                                    className={`${styles.navItem} ${!isProductManager ? styles.disabledLink : ''}`}
                                    onClick={() => handleManagementClick('deliveryManagement')}
                                >
                                    Delivery Management
                                    {!isProductManager && <span className={styles.noAccessIcon}>🔒</span>}
                                </li>
                                <li 
                                    className={`${styles.navItem} ${!isProductManager ? styles.disabledLink : ''}`}
                                    onClick={() => handleManagementClick('commentModeration')}
                                >
                                    Comment Moderation
                                    {!isProductManager && <span className={styles.noAccessIcon}>🔒</span>}
                                </li>
                                <li 
                                    className={`${styles.navItem} ${!isSalesManager ? styles.disabledLink : ''}`}
                                    onClick={() => handleManagementClick('salesManagement')}
                                >
                                    Sales Management
                                    {!isSalesManager && <span className={styles.noAccessIcon}>🔒</span>}
                                </li>
                                {isSalesManager && (
                                    <li 
                                        className={`${styles.navItem} ${activeTab === 'refundDashboard' ? styles.active : ''}`}
                                        onClick={() => setActiveTab('refundDashboard')}
                                    >
                                        Refund Dashboard
                                    </li>
                                )}
                            </>
                        )}
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