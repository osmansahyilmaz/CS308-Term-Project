import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './OrderHistory.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Refund Modal Component (can be in a separate file too)
const RefundModal = ({ item, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');

    if (!item) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for the refund.');
            return;
        }
        onSubmit(item.id, reason); // Assuming item.id is product_of_order_id
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>Request Refund for: {item.name}</h3>
                <textarea
                    className={styles.reasonTextarea}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe the reason for your refund request..."
                    rows={4}
                />
                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.modalButtonCancel}>Cancel</button>
                    <button onClick={handleSubmit} className={styles.modalButtonSubmit}>Submit Request</button>
                </div>
            </div>
        </div>
    );
};

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedYear, setSelectedYear] = useState('all');
    const navigate = useNavigate();
    
    // State for refund modal
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedItemForRefund, setSelectedItemForRefund] = useState(null);
    
    const BASE_URL = 'http://localhost:5000/api';
    
    useEffect(() => {
        fetchOrders();
    }, []);
    
    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${BASE_URL}/orders/history`, { withCredentials: true });
            const backendOrders = res.data.orders || [];

            const statusMap = {
                0: 'verifying',
                1: 'processing',
                2: 'shipped',
                3: 'delivered',
                4: 'cancelled'
            };

            const mappedOrders = backendOrders.map(o => ({
                ...o,
                order_status: statusMap[o.order_status] || 'processing',
                products: o.products ? o.products.map(p => {
                    // Backend should provide product_of_order_id for each item in an order.
                    // This ID is crucial for linking to the refund_requests table.
                    const productOfOrderId = p.product_of_order_id;
                    if (productOfOrderId === undefined || productOfOrderId === null) {
                        console.warn('Order item is missing product_of_order_id:', p, 'Order:', o.order_id);
                    }
                    return {
                        ...p,
                        // Use product_of_order_id as the primary identifier for refund purposes.
                        // Fallback to product_id only if absolutely necessary and if backend refund logic can handle it (currently it cannot).
                        id: productOfOrderId !== undefined && productOfOrderId !== null ? productOfOrderId : p.product_id 
                    };
                }) : [] 
            }));

            setOrders(mappedOrders);
            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching orders from backend:', err);
            // Fallback to localStorage
            try {
                const orderHistoryString = localStorage.getItem('orderHistory');
                const orderHistory = orderHistoryString ? JSON.parse(orderHistoryString) : [];
                const sortedOrders = orderHistory.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
                setOrders(sortedOrders);
            } catch (localErr) {
                console.error('Error fetching orders from localStorage:', localErr);
                setError('An error occurred while fetching your orders.');
            }
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
            case 'verifying':
                return 'Verifying';
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
            case 'verifying':
                return styles.statusProcessing;
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

    async function handleCancelOrder(orderId) {
        if (!window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            await axios.delete(`${BASE_URL}/orders/${orderId}/cancel`, { withCredentials: true });
            toast.success('Order cancelled successfully.');
            fetchOrders(); // Refresh list after cancellation
        } catch (err) {
            console.error('Error cancelling order:', err);
            toast.error(err.response?.data?.message || 'Failed to cancel order.');
            setError('Failed to cancel order.');
        }
    }

    const handleOpenRefundModal = (item) => {
        console.log('Requesting refund for item:', item);
        setSelectedItemForRefund(item);
        setShowRefundModal(true);
    };

    const handleCloseRefundModal = () => {
        setShowRefundModal(false);
        setSelectedItemForRefund(null);
    };

    const handleSubmitRefund = async (itemId, reason) => {
        if (itemId === undefined || itemId === null) {
            toast.error('Cannot submit refund: Item ID is missing. Please contact support.');
            console.error('handleSubmitRefund: itemId is missing or invalid.', itemId);
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/refund-request`, 
                { item_id: itemId, reason }, 
                { withCredentials: true }
            );
            toast.success(response.data.message || 'Refund request submitted successfully!');
            handleCloseRefundModal();
            fetchOrders(); // Refresh orders to reflect any potential UI changes (e.g., disable button)
        } catch (err) {
            console.error('Error submitting refund request. Full error object:', err);
            if (err.response) {
                console.error('Error response data:', err.response.data);
                console.error('Error response status:', err.response.status);
                console.error('Error response headers:', err.response.headers);
                toast.error(err.response.data.message || `Error: ${err.response.status} - Failed to submit refund request.`);
            } else if (err.request) {
                console.error('Error request data:', err.request);
                toast.error('Failed to submit refund request. No response from server.');
            } else {
                console.error('Error message:', err.message);
                toast.error(`Failed to submit refund request: ${err.message}`);
            }
        }
    };

    const canRequestRefund = (orderDate, orderStatus, item) => { // Added item parameter
        if (orderStatus !== 'delivered') return false;
        
        const orderPlacedDate = new Date(orderDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (orderPlacedDate < thirtyDaysAgo) return false; // Older than 30 days

        // TODO: Check if item.id (product_of_order_id) has an existing refund request.
        // This requires backend to provide this info or fetching refunds separately.
        // For now, we assume no existing refund if conditions above are met.
        // Example: if (item.refund_status && item.refund_status !== 'Rejected') return false;

        return true; 
    };

    return (
        <div className={styles.orderHistory}>
            <ToastContainer position="top-right" autoClose={3000} />
            {showRefundModal && selectedItemForRefund && (
                <RefundModal 
                    item={selectedItemForRefund} 
                    onClose={handleCloseRefundModal} 
                    onSubmit={handleSubmitRefund} 
                />
            )}
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
                                    <div key={item.id} className={styles.orderItem}>
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
                                            {canRequestRefund(order.order_date, order.order_status, item) && (
                                                <button 
                                                    onClick={() => handleOpenRefundModal(item)}
                                                    className={`${styles.actionButton} ${styles.requestRefundButton}`}
                                                >
                                                    Request Refund
                                                </button>
                                            )}
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
                                    
                                    {(order.order_status === 'processing' || order.order_status === 'verifying') && (
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
};

export default OrderHistory; 