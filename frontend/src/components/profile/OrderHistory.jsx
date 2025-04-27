import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './OrderHistory.module.css';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedYear, setSelectedYear] = useState('all');
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchOrders();
    }, []);
    
    const fetchOrders = () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Get order history from localStorage instead of API
            const orderHistoryString = localStorage.getItem('orderHistory');
            const orderHistory = orderHistoryString ? JSON.parse(orderHistoryString) : [];
            
            // Sort orders by date (newest first)
            const sortedOrders = orderHistory.sort((a, b) => 
                new Date(b.order_date) - new Date(a.order_date)
            );
            
            setOrders(sortedOrders);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('An error occurred while fetching your orders.');
            setIsLoading(false);
        }
    };
    
    // Get unique years from order dates for filtering
    const getUniqueYears = () => {
        const years = [...new Set(orders.map(order => new Date(order.order_date).getFullYear()))];
        return years.sort((a, b) => b - a); // Sort descending
    };
    
    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };
    
    // Format price for display
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
        }).format(amount);
    };
    
    // Filter orders by year
    const getFilteredOrders = () => {
        if (selectedYear === 'all') {
            return orders;
        }
        
        return orders.filter(order => 
            new Date(order.order_date).getFullYear().toString() === selectedYear
        );
    };
    
    // Handle year filter change
    const handleYearChange = (e) => {
        setSelectedYear(e.target.value);
    };

    // Get status text based on order_status number
    const getStatusText = (status) => {
        switch (status) {
            case 'processing':
                return 'Processing';
            case 'shipped':
                return 'Shipped';
            case 'delivered':
                return 'Delivered';
            case 'cancelled':
                return 'Cancelled';
            default:
                return 'Unknown';
        }
    };
    
    // Get CSS class for status
    const getStatusClass = (status) => {
        switch (status) {
            case 'processing':
                return styles.statusProcessing;
            case 'shipped':
                return styles.statusShipped;
            case 'delivered':
                return styles.statusDelivered;
            case 'cancelled':
                return styles.statusCancelled;
            default:
                return '';
        }
    };

    const handleViewOrderDetails = (orderId) => {
        // For now, just show alert with order details since we don't have a separate page
        const order = orders.find(order => order.order_id === orderId);
        if (order) {
            alert(`Order Details for #${orderId}\nDate: ${formatDate(order.order_date)}\nStatus: ${getStatusText(order.order_status)}\nTotal: ${formatCurrency(order.order_total_price)}`);
        }
    };

    return (
        <div className={styles.orderHistory}>
            <div className={styles.header}>
                <h2>Order History</h2>
                <div className={styles.filterContainer}>
                    <label htmlFor="yearFilter">Filter by Year:</label>
                    <select 
                        id="yearFilter" 
                        value={selectedYear}
                        onChange={handleYearChange}
                        className={styles.yearFilter}
                    >
                        <option value="all">All Years</option>
                        {getUniqueYears().map(year => (
                            <option key={year} value={year.toString()}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {error && (
                <div className={styles.errorMessage}>{error}</div>
            )}
            
            {isLoading ? (
                <div className={styles.loading}>Loading your orders...</div>
            ) : getFilteredOrders().length === 0 ? (
                <div className={styles.emptyState}>
                    <p>You don't have any orders yet.</p>
                    <button 
                        onClick={() => navigate('/shop')}
                        className={styles.shopNowButton}
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className={styles.ordersList}>
                    {getFilteredOrders().map(order => (
                        <div key={order.order_id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div className={styles.orderInfo}>
                                    <div className={styles.orderNumber}>
                                        <span className={styles.label}>Order #:</span>
                                        <span className={styles.value}>{order.order_id}</span>
                                    </div>
                                    <div className={styles.orderDate}>
                                        <span className={styles.label}>Date:</span>
                                        <span className={styles.value}>{formatDate(order.order_date)}</span>
                                    </div>
                                </div>
                                <div className={styles.orderTotal}>
                                    <span className={styles.label}>Total:</span>
                                    <span className={styles.value}>{formatCurrency(order.order_total_price)}</span>
                                </div>
                                <div className={`${styles.orderStatus} ${getStatusClass(order.order_status)}`}>
                                    {getStatusText(order.order_status)}
                                </div>
                            </div>
                            
                            <div className={styles.orderItems}>
                                {order.products && order.products.map(item => (
                                    <div key={item.product_id} className={styles.orderItem}>
                                        <div className={styles.itemImage}>
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} />
                                            ) : (
                                                <div className={styles.noImage}>No Image</div>
                                            )}
                                        </div>
                                        <div className={styles.itemDetails}>
                                            <h3 className={styles.itemName}>
                                                <Link to={`/products/${item.product_id}`}>{item.name}</Link>
                                            </h3>
                                            <div className={styles.itemMeta}>
                                                <span className={styles.itemPrice}>
                                                    {formatCurrency(item.price_when_buy)}
                                                </span>
                                                <span className={styles.itemQuantity}>
                                                    Quantity: {item.product_order_count}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className={styles.orderFooter}>
                                <div className={styles.orderActions}>
                                    <button 
                                        onClick={() => handleViewOrderDetails(order.order_id)}
                                        className={styles.viewDetailsButton}
                                    >
                                        View Details
                                    </button>
                                    
                                    {order.order_status === 'delivered' && (
                                        <button className={styles.reviewButton}>
                                            Write a Review
                                        </button>
                                    )}
                                    
                                    {order.order_status === 'processing' && (
                                        <button 
                                            className={styles.cancelButton}
                                            onClick={() => handleCancelOrder(order.order_id)}
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
    
    // Handle order cancellation
    function handleCancelOrder(orderId) {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }
        
        try {
            // Get orders from localStorage
            const orderHistoryString = localStorage.getItem('orderHistory');
            const orderHistory = orderHistoryString ? JSON.parse(orderHistoryString) : [];
            
            // Update the order status to cancelled
            const updatedOrders = orderHistory.map(order => {
                if (order.order_id === orderId) {
                    return { ...order, order_status: 'cancelled' };
                }
                return order;
            });
            
            // Save back to localStorage
            localStorage.setItem('orderHistory', JSON.stringify(updatedOrders));
            
            // Update state to reflect changes
            setOrders(updatedOrders);
        } catch (error) {
            console.error('Error cancelling order:', error);
            setError('An error occurred while cancelling the order.');
        }
    }
};

export default OrderHistory; 