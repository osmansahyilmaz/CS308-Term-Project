import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./CheckoutSuccess.module.css";
import axios from "axios";

// Base URL for backend API
const BASE_URL = 'http://localhost:5000/api';

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { order, invoiceId, invoicePdfUrl } = state || {};

  useEffect(() => {
    // Update order status to processing
    const updateOrderStatus = async () => {
      if (order && order.order_id) {
        try {
          await axios.post(
            `http://localhost:5000/api/orders/${order.order_id}/success`,
            {},
            { withCredentials: true }
          );
          console.log("✅ Order status updated to processing");
        } catch (error) {
          console.error("❌ Error updating order status:", error);
        }
      }
    };

    if (order) {
      updateOrderStatus();
      
      console.log("📃 Invoice data:", { invoiceId, invoicePdfUrl });
      
      // Navigate to invoice page after delay
      const t = setTimeout(() => {
        navigate("/invoice", { 
          state: { 
            order,
            invoiceId,
            invoicePdfUrl
          } 
        });
      }, 3000);
      
      return () => clearTimeout(t);
    }
  }, [navigate, order, invoiceId, invoicePdfUrl]);

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
          {invoicePdfUrl && (
            <p className={styles.invoiceInfo}>Invoice #{order.invoiceNumber}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
