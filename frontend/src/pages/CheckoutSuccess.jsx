import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./CheckoutSuccess.module.css";
import axios from "axios";

// Base URL for backend API
const BASE_URL = 'http://localhost:5000/api';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { order, backendOrderId } = state || {};

  useEffect(() => {
    if (order) {
      // Update order status to processing
      if (backendOrderId) {
        axios.put(`${BASE_URL}/orders/${backendOrderId}/success`, {}, { withCredentials: true })
          .then(res => {
            console.log('Order status updated to processing:', res.data);
          })
          .catch(err => {
            console.error('Error updating order status:', err);
          });
      }

      // Redirect to invoice after a short delay
      const t = setTimeout(() => {
        navigate("/invoice", { state: { order } });
      }, 3000); // Increased delay to show success message longer
      return () => clearTimeout(t);
    }
  }, [navigate, order, backendOrderId]);

  if (!order) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.leftWrapper}></div>
        <div className={styles.rightPanel}>
          <div className={styles.successBox}>
            <h2 className={styles.successTitle}>⚠️ Order data not found</h2>
            <p className={styles.successMessage}>Please complete the payment process first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.leftWrapper}></div>
      <div className={styles.rightPanel}>
        <div className={styles.successBox}>
          <h2 className={styles.successTitle}>✅ Payment Successful</h2>
          <p className={styles.successMessage}>Your order is being processed. Redirecting to your invoice…</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
