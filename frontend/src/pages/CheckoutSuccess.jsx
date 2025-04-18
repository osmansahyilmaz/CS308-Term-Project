import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./CheckoutSuccess.module.css";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { order } = state || {};

  useEffect(() => {
    if (order) {
      const t = setTimeout(() => {
        navigate("/invoice", { state: { order } });
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [navigate, order]);

  if (!order) {
    return (
      <div className={styles.checkoutContainer}>
        <div className={styles.leftWrapper}></div>
        <div className={styles.rightPanel}>
          <div className={styles.successBox}>
            <h2 className={styles.successTitle}>⚠️ Sipariş verisi bulunamadı</h2>
            <p className={styles.successMessage}>Lütfen önce ödeme işlemini tamamlayın.</p>
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
          <p className={styles.successMessage}>Redirecting to your invoice…</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
