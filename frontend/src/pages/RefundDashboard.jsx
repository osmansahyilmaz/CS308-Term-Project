import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './RefundDashboard.module.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RefundCard from '../components/refunds/RefundCard';

const RefundDashboard = () => {
    const [refundRequests, setRefundRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('Pending'); // Default to Pending

    const BASE_URL = 'http://localhost:5000/api';

    const fetchRefundRequests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}/admin/refund-requests`, {
                withCredentials: true
            });
            setRefundRequests(response.data || []);
        } catch (err) {
            console.error('Error fetching refund requests:', err);
            setError(err.response?.data?.message || 'Failed to fetch refund requests.');
            toast.error(err.response?.data?.message || 'Failed to fetch refund requests.');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchRefundRequests();
    }, [fetchRefundRequests]);

    const handleUpdateRequestStatus = async (refundId, newStatus) => {
        try {
            await axios.patch(`${BASE_URL}/admin/refund-requests/${refundId}`,
                { status: newStatus },
                { withCredentials: true }
            );
            toast.success(`Refund request ${newStatus.toLowerCase()} successfully.`);
            fetchRefundRequests(); // Refresh the list
        } catch (err) {
            console.error(`Error updating refund status to ${newStatus}:`, err);
            toast.error(err.response?.data?.message || `Failed to update status to ${newStatus}.`);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const filteredRequests = refundRequests.filter(req => {
        if (filterStatus === 'All') return true;
        return req.status === filterStatus;
    });

    return (
        <div className={styles.dashboardContainer}>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className={styles.header}>
                <h2>Refund Requests Dashboard</h2>
                <div className={styles.filterControls}>
                    <label htmlFor="statusFilter">Filter by Status: </label>
                    <select
                        id="statusFilter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.statusFilterSelect}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="All">All</option>
                    </select>
                </div>
            </div>

            {error && (
                 <div className={styles.errorMessage}>{error}</div>
            )}

            {isLoading ? (
                <div className={styles.loading}>Loading refund requests...</div>
            ) : filteredRequests.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No refund requests found for the selected status.</p>
                </div>
            ) : (
                <div className={styles.refundCardsContainer}>
                    {filteredRequests.map(req => (
                        <RefundCard
                            key={req.refund_id}
                            request={req}
                            onApprove={handleUpdateRequestStatus}
                            onReject={handleUpdateRequestStatus}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RefundDashboard; 