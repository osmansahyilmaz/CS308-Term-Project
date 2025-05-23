import React from 'react';
import styles from './RefundCard.module.css';

// Placeholder for product image - replace with actual image source
const placeholderImage = 'https://via.placeholder.com/150';

const RefundCard = ({ request, onApprove, onReject }) => {
    const {
        product_name,
        refund_amount,
        reason,
        customer_email,
        order_date, // Assuming order_date is available in request object
        request_date,
        status,
        product_image_url // Assuming product_image_url will be part of the request object
    } = request;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD' // Assuming USD, adjust if necessary
        }).format(amount);
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={product_image_url || placeholderImage} alt={product_name} className={styles.productImage} />
            </div>
            <div className={styles.cardContent}>
                <h3 className={styles.productName}>{product_name}</h3>
                <p className={styles.refundAmount}>{formatCurrency(refund_amount)}</p>
                <p className={styles.detailItem}><span className={styles.detailLabel}>Reason:</span> {reason}</p>
                <p className={styles.detailItem}><span className={styles.detailLabel}>Customer Email:</span> {customer_email}</p>
                <p className={styles.detailItem}><span className={styles.detailLabel}>Order Date:</span> {formatDate(order_date)}</p>
                <p className={styles.detailItem}><span className={styles.detailLabel}>Refund Requested:</span> {formatDate(request_date)}</p>

                {status === 'Pending' ? (
                    <div className={styles.actionButtons}>
                        <button
                            onClick={() => onApprove(request.refund_id, 'Approved')}
                            className={`${styles.button} ${styles.approveButton}`}
                        >
                            ✅ Approve Refund
                        </button>
                        <button
                            onClick={() => onReject(request.refund_id, 'Rejected')}
                            className={`${styles.button} ${styles.rejectButton}`}
                        >
                            ❌ Reject Refund
                        </button>
                    </div>
                ) : (
                    <div className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RefundCard; 