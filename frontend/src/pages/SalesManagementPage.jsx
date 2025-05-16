import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './SalesManagementPage.module.css';

const SalesManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [unpricedProducts, setUnpricedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('pricing');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [discountRate, setDiscountRate] = useState(0);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchUnpricedProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products?priced=true');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
      createSamplePricedProducts();
      setError('Failed to load real data. Showing sample data for demonstration.');
    }
  };

  const fetchUnpricedProducts = async () => {
    try {
      const response = await axios.get('/api/products?priced=false');
      setUnpricedProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch unpriced products:', error);
      toast.error('Failed to fetch unpriced products');
      createSampleUnpricedProducts();
      setError('Failed to load real data. Showing sample data for demonstration.');
    }
  };

  const fetchInvoices = async () => {
    try {
      if (!dateRange.startDate || !dateRange.endDate) {
        toast.error('Please select a date range');
        return;
      }
      
      const response = await axios.get(
        `/api/invoices?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to fetch invoices');
      createSampleInvoices();
      setError('Failed to load real data. Showing sample data for demonstration.');
    }
  };

  const setProductPrice = async (productId, price) => {
    try {
      await axios.put(`/api/products/${productId}/price`, { price });
      toast.success('Product price updated successfully');
      fetchProducts();
      fetchUnpricedProducts();
    } catch (error) {
      toast.error('Failed to update product price');
      console.error(error);
    }
  };

  const applyDiscount = async () => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }
    
    if (discountRate <= 0 || discountRate > 100) {
      toast.error('Discount rate must be between 1 and 100');
      return;
    }
    
    try {
      await axios.post('/api/discounts', {
        productIds: selectedProducts,
        discountRate
      });
      toast.success('Discount applied successfully');
      setSelectedProducts([]);
      setDiscountRate(0);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to apply discount');
      console.error(error);
    }
  };

  const handleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const downloadPdf = (invoiceId) => {
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  };
  
  const calculateTotalRevenue = () => {
    return invoices.reduce((total, invoice) => total + invoice.totalAmount, 0).toFixed(2);
  };

  // Sample data creation functions
  const createSamplePricedProducts = () => {
    const sampleProducts = [
      {
        _id: 'prod101',
        name: 'Smartphone X Pro',
        model: 'SP-X-PRO',
        costPrice: 499.99,
        price: 899.99,
        discountPercentage: 10,
        category: { name: 'Electronics' }
      },
      {
        _id: 'prod102',
        name: 'Wireless Headphones',
        model: 'WH-200',
        costPrice: 79.99,
        price: 149.99,
        discountPercentage: 0,
        category: { name: 'Audio' }
      },
      {
        _id: 'prod103',
        name: 'Smart Watch',
        model: 'SW-300',
        costPrice: 129.99,
        price: 249.99,
        discountPercentage: 15,
        category: { name: 'Wearables' }
      }
    ];
    
    setProducts(sampleProducts);
  };

  const createSampleUnpricedProducts = () => {
    const sampleUnpriced = [
      {
        _id: 'prod104',
        name: 'Bluetooth Speaker',
        model: 'BS-100',
        costPrice: 49.99,
        category: { name: 'Audio' }
      },
      {
        _id: 'prod105',
        name: 'USB-C Charger',
        model: 'UC-50',
        costPrice: 19.99,
        category: { name: 'Accessories' }
      }
    ];
    
    setUnpricedProducts(sampleUnpriced);
  };

  const createSampleInvoices = () => {
    const today = new Date();
    const sampleInvoices = [
      {
        _id: 'inv1001',
        customerName: 'John Doe',
        totalAmount: 899.99,
        paid: true,
        createdAt: new Date(today.setDate(today.getDate() - 1)).toISOString()
      },
      {
        _id: 'inv1002',
        customerName: 'Jane Smith',
        totalAmount: 1249.98,
        paid: true,
        createdAt: new Date(today.setDate(today.getDate() - 3)).toISOString()
      },
      {
        _id: 'inv1003',
        customerName: 'Robert Johnson',
        totalAmount: 349.95,
        paid: false,
        createdAt: new Date(today.setDate(today.getDate() - 5)).toISOString()
      }
    ];
    
    setInvoices(sampleInvoices);
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      {error && (
        <div className={styles.errorNotice}>
          <p>{error}</p>
        </div>
      )}
      <h1 className={styles.title}>Sales Management</h1>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'pricing' ? styles.active : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          Product Pricing
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'discounts' ? styles.active : ''}`}
          onClick={() => setActiveTab('discounts')}
        >
          Manage Discounts
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'invoices' ? styles.active : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices & Revenue
        </button>
      </div>
      
      {activeTab === 'pricing' && (
        <div className={styles.pricingSection}>
          <h2>New Products Requiring Pricing</h2>
          {unpricedProducts.length > 0 ? (
            <div className={styles.productGrid}>
              {unpricedProducts.map(product => (
                <div key={product._id} className={styles.productCard}>
                  <h3>{product.name}</h3>
                  <p><strong>Model:</strong> {product.model}</p>
                  <p><strong>Cost Price:</strong> ${product.costPrice}</p>
                  <p><strong>Category:</strong> {product.category.name}</p>
                  <div className={styles.priceForm}>
                    <label>Set Sale Price ($):</label>
                    <input 
                      type="number" 
                      min={0} 
                      step={0.01}
                      defaultValue={product.costPrice * 2}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const price = parseFloat(e.target.value);
                          if (price > 0) {
                            setProductPrice(product._id, price);
                          } else {
                            toast.error('Price must be greater than 0');
                          }
                        }
                      }}
                    />
                    <button 
                      onClick={(e) => {
                        const price = parseFloat(e.target.previousSibling.value);
                        if (price > 0) {
                          setProductPrice(product._id, price);
                        } else {
                          toast.error('Price must be greater than 0');
                        }
                      }}
                    >
                      Set Price
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noItems}>No products requiring pricing</p>
          )}
          
          <h2>Current Product Prices</h2>
          <div className={styles.productTable}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Model</th>
                  <th>Cost Price</th>
                  <th>Sale Price</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.model}</td>
                    <td>${product.costPrice.toFixed(2)}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>{product.discountPercentage ? `${product.discountPercentage}%` : '-'}</td>
                    <td>
                      ${(product.price * (1 - (product.discountPercentage || 0) / 100)).toFixed(2)}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          className={styles.editButton}
                          onClick={() => {
                            const newPrice = prompt('Enter new price:', product.price);
                            if (newPrice !== null && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
                              setProductPrice(product._id, parseFloat(newPrice));
                            }
                          }}
                        >
                          Update Price
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'discounts' && (
        <div className={styles.discountSection}>
          <h2>Create Discount</h2>
          <div className={styles.discountForm}>
            <div className={styles.formGroup}>
              <label>Discount Percentage:</label>
              <input 
                type="number" 
                min={1} 
                max={100}
                value={discountRate}
                onChange={(e) => setDiscountRate(parseInt(e.target.value))}
              />
            </div>
            <button 
              className={styles.applyButton}
              onClick={applyDiscount}
              disabled={selectedProducts.length === 0 || discountRate <= 0 || discountRate > 100}
            >
              Apply Discount to Selected Products
            </button>
          </div>
          
          <h2>Select Products for Discount</h2>
          <div className={styles.productGrid}>
            {products.map(product => (
              <div 
                key={product._id} 
                className={`${styles.productCard} ${selectedProducts.includes(product._id) ? styles.selected : ''}`}
                onClick={() => handleProductSelection(product._id)}
              >
                <div className={styles.checkboxContainer}>
                  <input 
                    type="checkbox" 
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => handleProductSelection(product._id)}
                  />
                </div>
                <h3>{product.name}</h3>
                <p><strong>Model:</strong> {product.model}</p>
                <p><strong>Current Price:</strong> ${product.price.toFixed(2)}</p>
                <p>
                  <strong>Current Discount:</strong> 
                  {product.discountPercentage ? `${product.discountPercentage}%` : 'None'}
                </p>
                {selectedProducts.includes(product._id) && (
                  <p className={styles.newPrice}>
                    <strong>New Price After Discount:</strong> 
                    ${(product.price * (1 - discountRate / 100)).toFixed(2)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'invoices' && (
        <div className={styles.invoiceSection}>
          <h2>View Invoices</h2>
          <div className={styles.dateFilter}>
            <div className={styles.formGroup}>
              <label>Start Date:</label>
              <input 
                type="date" 
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date:</label>
              <input 
                type="date" 
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>
            <button 
              className={styles.fetchButton}
              onClick={fetchInvoices}
            >
              Fetch Invoices
            </button>
          </div>
          
          {invoices.length > 0 && (
            <div className={styles.revenueStats}>
              <div className={styles.statCard}>
                <h3>Total Revenue</h3>
                <p className={styles.statValue}>${calculateTotalRevenue()}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Invoices</h3>
                <p className={styles.statValue}>{invoices.length}</p>
              </div>
              {/* Additional stats cards can be added here */}
            </div>
          )}
          
          <div className={styles.invoiceTable}>
            {invoices.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice._id}>
                      <td>{invoice._id.substring(0, 8)}...</td>
                      <td>{invoice.customerName}</td>
                      <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td>${invoice.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={invoice.paid ? styles.statusPaid : styles.statusPending}>
                          {invoice.paid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.downloadButton}
                            onClick={() => downloadPdf(invoice._id)}
                          >
                            Download PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.noItems}>No invoices found for the selected date range</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesManagementPage; 