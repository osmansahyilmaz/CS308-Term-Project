import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './DeliveryManagementPage.module.css';

const DeliveryManagementPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await axios.get('/api/deliveries');
      setDeliveries(response.data);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error);
      toast.error('Failed to fetch deliveries');
      createSampleDeliveryData();
      setError('Failed to load real data. Showing sample data for demonstration.');
    }
  };

  const createSampleDeliveryData = () => {
    const sampleDeliveries = [
      {
        _id: 'del1000001',
        customerId: 'customer123',
        customerName: 'John Doe',
        totalPrice: 567.99,
        isCompleted: false,
        deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
        items: [
          { productId: 'prod101', productName: 'Smartphone X', quantity: 1, price: 499.99 },
          { productId: 'prod105', productName: 'Phone Case', quantity: 2, price: 19.99 }
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
      },
      {
        _id: 'del1000002',
        customerId: 'customer456',
        customerName: 'Jane Smith',
        totalPrice: 249.99,
        isCompleted: true,
        deliveryAddress: '456 Oak Avenue, Chicago, IL 60001',
        items: [
          { productId: 'prod102', productName: 'Wireless Headphones', quantity: 1, price: 149.99 },
          { productId: 'prod106', productName: 'Extended Warranty', quantity: 1, price: 49.99 },
          { productId: 'prod108', productName: 'USB-C Cable', quantity: 2, price: 24.99 }
        ],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
      },
      {
        _id: 'del1000003',
        customerId: 'customer789',
        customerName: 'Robert Johnson',
        totalPrice: 1299.99,
        isCompleted: false,
        deliveryAddress: '789 Pine Road, Austin, TX 73301',
        items: [
          { productId: 'prod103', productName: 'Laptop Pro', quantity: 1, price: 1299.99 }
        ],
        createdAt: new Date().toISOString() // today
      }
    ];
    
    setDeliveries(sampleDeliveries);
  };

  const updateDeliveryStatus = async (deliveryId, isCompleted) => {
    try {
      await axios.put(`/api/deliveries/${deliveryId}/status`, { isCompleted });
      toast.success(`Delivery marked as ${isCompleted ? 'completed' : 'pending'}`);
      fetchDeliveries();
      
      if (selectedDelivery && selectedDelivery._id === deliveryId) {
        setSelectedDelivery({
          ...selectedDelivery,
          isCompleted
        });
      }
    } catch (error) {
      toast.error('Failed to update delivery status');
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
    : deliveries.filter(d => d.isCompleted === (filterStatus === 'completed'));

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
          <option value="completed">Completed</option>
        </select>
      </div>
      
      <div className={styles.deliveryListContainer}>
        <table className={styles.deliveryTable}>
          <thead>
            <tr>
              <th>Delivery ID</th>
              <th>Customer</th>
              <th>Total Items</th>
              <th>Total Price</th>
              <th>Address</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map(delivery => (
                <tr key={delivery._id} className={delivery.isCompleted ? styles.completedDelivery : ''}>
                  <td>{delivery._id.substring(0, 8)}...</td>
                  <td>{delivery.customerId}</td>
                  <td>{delivery.items?.length || 0}</td>
                  <td>${delivery.totalPrice.toFixed(2)}</td>
                  <td className={styles.addressCell}>
                    {delivery.deliveryAddress.substring(0, 20)}...
                  </td>
                  <td>
                    <span className={delivery.isCompleted ? styles.statusCompleted : styles.statusPending}>
                      {delivery.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.viewButton}
                        onClick={() => viewDeliveryDetails(delivery)}
                      >
                        View
                      </button>
                      <button 
                        className={delivery.isCompleted ? styles.pendingButton : styles.completeButton}
                        onClick={() => updateDeliveryStatus(delivery._id, !delivery.isCompleted)}
                      >
                        {delivery.isCompleted ? 'Mark Pending' : 'Mark Completed'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className={styles.noDeliveries}>
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
                <p><strong>Delivery ID:</strong> {selectedDelivery._id}</p>
                <p><strong>Customer ID:</strong> {selectedDelivery.customerId}</p>
                <p><strong>Total Price:</strong> ${selectedDelivery.totalPrice.toFixed(2)}</p>
                <p><strong>Status:</strong> {selectedDelivery.isCompleted ? 'Completed' : 'Pending'}</p>
              </div>
              
              <div className={styles.detailSection}>
                <h3>Address</h3>
                <p>{selectedDelivery.deliveryAddress}</p>
              </div>
              
              <div className={styles.detailSection}>
                <h3>Items</h3>
                {selectedDelivery.items && selectedDelivery.items.length > 0 ? (
                  <table className={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDelivery.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>${item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No items in this delivery</p>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={selectedDelivery.isCompleted ? styles.pendingButton : styles.completeButton}
                onClick={() => {
                  updateDeliveryStatus(selectedDelivery._id, !selectedDelivery.isCompleted);
                }}
              >
                {selectedDelivery.isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
              </button>
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