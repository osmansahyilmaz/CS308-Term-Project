import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './ProductManagementPage.module.css';

const ProductManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('');
  const [error, setError] = useState(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
      // Create sample data for demonstration
      createSampleProductData();
      setError('Failed to load real data. Showing sample data for demonstration.');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
      
      // Add default categories if none exist
      if (response.data.length === 0) {
        await addDefaultCategories();
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to fetch categories');
      // Create sample categories for demonstration
      createSampleCategoryData();
      setError('Failed to load real data. Showing sample data for demonstration.');
    }
  };

  const addDefaultCategories = async () => {
    try {
      const defaultCategories = ['Electronics', 'Wearables'];
      
      for (const categoryName of defaultCategories) {
        await axios.post('/api/categories', { name: categoryName });
      }
      
      // Fetch categories again to update the list
      const response = await axios.get('/api/categories');
      setCategories(response.data);
      toast.success('Default categories added successfully');
    } catch (error) {
      toast.error('Failed to add default categories');
      console.error(error);
    }
  };

  const onSubmitProduct = async (data) => {
    try {
      if (isEditing) {
        await axios.put(`/api/products/${currentProduct._id}`, data);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/products', data);
        toast.success('Product created successfully');
      }
      reset();
      setIsEditing(false);
      setCurrentProduct(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
      console.error(error);
    }
  };

  const onSubmitCategory = async (e) => {
    e.preventDefault();
    if (!currentCategory) return;
    
    try {
      await axios.post('/api/categories', { name: currentCategory });
      toast.success('Category added successfully');
      setCurrentCategory('');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to add category');
      console.error(error);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`/api/products/${id}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
      console.error(error);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await axios.delete(`/api/categories/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
      console.error(error);
    }
  };

  const editProduct = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    Object.keys(product).forEach(key => {
      setValue(key, product[key]);
    });
  };

  const updateStock = async (id, newStock) => {
    try {
      await axios.put(`/api/products/${id}/stock`, { countInStock: newStock });
      toast.success('Stock updated successfully');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update stock');
      console.error(error);
    }
  };

  // Sample data creation functions
  const createSampleProductData = () => {
    const sampleProducts = [
      {
        _id: 'sample1',
        name: 'Sample Smartphone',
        model: 'X-2000',
        description: 'High-end smartphone with advanced features',
        category: { _id: 'cat1', name: 'Electronics' },
        price: 899.99,
        costPrice: 499.99,
        countInStock: 25,
        image: 'https://via.placeholder.com/150',
        serialNumber: 'SN-2023-001'
      },
      {
        _id: 'sample2',
        name: 'Sample Smartwatch',
        model: 'W-500',
        description: 'Fitness tracking smartwatch',
        category: { _id: 'cat2', name: 'Wearables' },
        price: 199.99,
        costPrice: 99.99,
        countInStock: 40,
        image: 'https://via.placeholder.com/150',
        serialNumber: 'SN-2023-002'
      },
      {
        _id: 'sample3',
        name: 'Sample Headphones',
        model: 'H-100',
        description: 'Noise cancelling wireless headphones',
        category: { _id: 'cat1', name: 'Electronics' },
        price: 149.99,
        costPrice: 79.99,
        countInStock: 15,
        image: 'https://via.placeholder.com/150',
        serialNumber: 'SN-2023-003'
      }
    ];
    
    setProducts(sampleProducts);
  };

  const createSampleCategoryData = () => {
    const sampleCategories = [
      { _id: 'cat1', name: 'Electronics' },
      { _id: 'cat2', name: 'Wearables' },
      { _id: 'cat3', name: 'Audio' },
      { _id: 'cat4', name: 'Accessories' }
    ];
    
    setCategories(sampleCategories);
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      {error && (
        <div className={styles.errorNotice}>
          <p>{error}</p>
        </div>
      )}
      <h1 className={styles.title}>Product Management</h1>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'products' ? styles.active : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'categories' ? styles.active : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'stocks' ? styles.active : ''}`}
          onClick={() => setActiveTab('stocks')}
        >
          Stock Management
        </button>
      </div>
      
      {activeTab === 'products' && (
        <div className={styles.formSection}>
          <h2>{isEditing ? 'Edit Product' : 'Create New Product'}</h2>
          <form onSubmit={handleSubmit(onSubmitProduct)}>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input 
                type="text" 
                {...register('name', { required: 'Product name is required' })}
              />
              {errors.name && <span className={styles.error}>{errors.name.message}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Model</label>
              <input 
                type="text" 
                {...register('model', { required: 'Model is required' })}
              />
              {errors.model && <span className={styles.error}>{errors.model.message}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Serial Number</label>
              <input 
                type="text" 
                {...register('serialNumber')}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea 
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && <span className={styles.error}>{errors.description.message}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Category</label>
              <select 
                {...register('category', { required: 'Category is required' })}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <span className={styles.error}>{errors.category.message}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Image URL</label>
              <input 
                type="text" 
                {...register('image')}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Cost Price</label>
              <input 
                type="number" 
                {...register('costPrice', { 
                  required: 'Cost price is required',
                  min: { value: 0, message: 'Cost price must be positive' } 
                })}
              />
              {errors.costPrice && <span className={styles.error}>{errors.costPrice.message}</span>}
            </div>
            
            <div className={styles.formGroup}>
              <label>Initial Stock</label>
              <input 
                type="number" 
                {...register('countInStock', { 
                  required: 'Initial stock is required',
                  min: { value: 0, message: 'Stock must be positive' } 
                })}
              />
              {errors.countInStock && <span className={styles.error}>{errors.countInStock.message}</span>}
            </div>
            
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.submitButton}>
                {isEditing ? 'Update Product' : 'Create Product'}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => {
                    reset();
                    setIsEditing(false);
                    setCurrentProduct(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          
          <h2>Product List</h2>
          <div className={styles.productsList}>
            {products.map(product => (
              <div key={product._id} className={styles.productCard}>
                <h3>{product.name}</h3>
                <p><strong>Model:</strong> {product.model}</p>
                <p><strong>Serial Number:</strong> {product.serialNumber}</p>
                <p><strong>Cost Price:</strong> ${product.costPrice}</p>
                <p><strong>Stock:</strong> {product.countInStock}</p>
                <div className={styles.productActions}>
                  <button onClick={() => editProduct(product)}>Edit</button>
                  <button onClick={() => deleteProduct(product._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'categories' && (
        <div className={styles.formSection}>
          <h2>Add Category</h2>
          <form onSubmit={onSubmitCategory} className={styles.categoryForm}>
            <input 
              type="text" 
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              placeholder="Category name"
              required
            />
            <button type="submit">Add Category</button>
          </form>
          
          <h2>Categories List</h2>
          <div className={styles.categoriesList}>
            {categories.map(category => (
              <div key={category._id} className={styles.categoryItem}>
                <span>{category.name}</span>
                <button onClick={() => deleteCategory(category._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'stocks' && (
        <div className={styles.formSection}>
          <h2>Stock Management</h2>
          <div className={styles.stockTable}>
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Model</th>
                  <th>Current Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.model}</td>
                    <td>{product.countInStock}</td>
                    <td>
                      <div className={styles.stockActions}>
                        <button onClick={() => {
                          const newStock = prompt(`Enter new stock for ${product.name}:`, product.countInStock);
                          if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
                            updateStock(product._id, parseInt(newStock));
                          }
                        }}>
                          Update Stock
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
    </div>
  );
};

export default ProductManagementPage; 