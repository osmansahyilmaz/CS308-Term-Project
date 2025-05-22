import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './DeliveryManagementPage.module.css';

const statusLabels = {
  1: 'Processing',
  2: 'In-Transit',
  3: 'Delivered',
  4: 'Canceled', // Add Canceled label
};
const statusOptions = [
  { value: 'processing', label: 'Processing' },
  { value: 'in-transit', label: 'In-Transit' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'canceled', label: 'Canceled' }, // Add Canceled option
];

const getStatusValue = (order_status) => {
  if (order_status === 1) return 'processing';
  if (order_status === 2) return 'in-transit';
  if (order_status === 3) return 'delivered';
  if (order_status === 4) return 'canceled'; // Handle canceled
  return '';
};

const DeliveryManagementPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeliveries();
    // eslint-disable-next-line
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/pending-deliveries', { withCredentials: true });
      const deliveriesData = response.data.pendingDeliveries || [];
      const deliveriesWithInvoices = await Promise.all(
        deliveriesData.map(async (delivery) => {
          let invoice = null;
          try {
            const invoiceRes = await axios.get(`http://localhost:5000/api/invoices/by-order/${delivery.delivery_id}`, { withCredentials: true });
            invoice = invoiceRes.data;
          } catch (err) {
            invoice = null;
          }
          return { ...delivery, invoice };
        })
      );
      setDeliveries(deliveriesWithInvoices);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      toast.error('Failed to fetch deliveries');
      setError('Failed to load delivery data.');
      setDeliveries([]);
    }
  };

  const updateDeliveryStatus = async (orderId, status) => {
    try {
      await axios.patch(`http://localhost:5000/api/orders/${orderId}/status`, { status }, { withCredentials: true });
      toast.success(`Order status updated to ${status}`);
      fetchDeliveries();
      if (selectedDelivery && selectedDelivery.delivery_id === orderId) {
        setSelectedDelivery({ ...selectedDelivery, order_status: status });
      }
    } catch (error) {
      toast.error('Failed to update order status');
      console.error(error);
    }
  };

  const viewDeliveryDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDelivery(null);
  };

  const filteredDeliveries = filterStatus === 'all'
    ? deliveries
    : deliveries.filter(d => {
        if (filterStatus === 'pending') return d.order_status !== 3;
        if (filterStatus === 'completed') return d.order_status === 3;
        return true;
      });

  return (
    <div className={styles.container}>
      <ToastContainer />
      {error && (
        <div className={styles.errorNotice}>
          <p>{error}</p>
        </div>
      )}
      <h1 className={styles.title}>Delivery Management</h1>
      <div className={styles.filterSection}>
        <label>Filter by Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Deliveries</option>
          <option value="pending">Pending</option>
          <option value="completed">Delivered</option>
        </select>
      </div>
      <div className={styles.deliveryListContainer}>
        <table className={styles.deliveryTable}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total Items</th>
              <th>Total Price</th>
              <th>Address</th>
              <th>Status</th>
              <th>Invoice</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map(delivery => (
                <tr key={delivery.delivery_id} className={delivery.order_status === 3 ? styles.completedDelivery : ''}>
                  <td>{delivery.delivery_id}</td>
                  <td>{delivery.customer_name}</td>
                  <td>{delivery.products?.length || 0}</td>
                  <td>${Number(delivery.total_price).toFixed(2)}</td>
                  <td className={styles.addressCell}>
                    {delivery.address_title || 'N/A'}
                  </td>
                  <td>
                    <span className={
                      delivery.order_status === 3
                        ? styles.statusCompleted
                        : delivery.order_status === 4
                          ? styles.statusCanceled // Add a style for canceled if you want
                          : styles.statusPending
                    }>
                      {statusLabels[delivery.order_status] || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    {delivery.invoice && delivery.invoice.invoice_pdf_url ? (
                      <a
                        href={`http://localhost:5000${delivery.invoice.invoice_pdf_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View PDF
                      </a>
                    ) : (
                      'No Invoice'
                    )}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.viewButton}
                        onClick={() => viewDeliveryDetails(delivery)}
                      >
                        View
                      </button>
                      <select
                        value={getStatusValue(delivery.order_status)}
                        onChange={e => updateDeliveryStatus(delivery.delivery_id, e.target.value)}
                        className={styles.completeButton}
                        disabled={delivery.order_status === 3 || delivery.order_status === 4} // Disable if delivered or canceled
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={styles.noDeliveries}>
                  No deliveries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isDetailModalOpen && selectedDelivery && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Delivery Details</h2>
              <button className={styles.closeButton} onClick={closeDetailModal}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <h3>Basic Information</h3>
                <p><strong>Order ID:</strong> {selectedDelivery.delivery_id}</p>
                <p><strong>Customer:</strong> {selectedDelivery.customer_name}</p>
                <p><strong>Total Price:</strong> ${Number(selectedDelivery.total_price).toFixed(2)}</p>
                <p><strong>Status:</strong> {statusLabels[selectedDelivery.order_status] || 'Unknown'}</p>
              </div>
              <div className={styles.detailSection}>
                <h3>Address</h3>
                <p>
                  {selectedDelivery.address_title || 'N/A'}
                </p>
              </div>
              <div className={styles.detailSection}>
                <h3>Products</h3>
                {selectedDelivery.products && selectedDelivery.products.length > 0 ? (
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Discount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDelivery.products.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.product_name || item.name}</td>
                          <td>{item.quantity || item.product_order_count}</td>
                          <td>${Number(item.price || item.price_when_buy).toFixed(2)}</td>
                          <td>{item.discount || item.discount_when_buy || 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No products in this delivery</p>
                )}
              </div>
              <div className={styles.detailSection}>
                <h3>Invoice</h3>
                {selectedDelivery.invoice && selectedDelivery.invoice.invoice_pdf_url ? (
                  <a
                    href={`http://localhost:5000${selectedDelivery.invoice.invoice_pdf_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Invoice PDF
                  </a>
                ) : (
                  <p>No invoice available</p>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <select
                value={getStatusValue(selectedDelivery.order_status)}
                onChange={e => updateDeliveryStatus(selectedDelivery.delivery_id, e.target.value)}
                className={styles.completeButton}
                disabled={selectedDelivery.order_status === 3 || selectedDelivery.order_status === 4}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button className={styles.closeModalButton} onClick={closeDetailModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManagementPage;