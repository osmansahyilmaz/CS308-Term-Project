import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './ProductManagementPage.module.css';

const API_BASE = "http://localhost:5000/api";

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
      const response = await axios.get(`${API_BASE}/products`);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
      setProducts([]);
      setError('Failed to load real data.');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      // Accept both {categories: [...]} (array of strings) and array of objects
      let cats = [];
      if (Array.isArray(response.data.categories)) {
        cats = response.data.categories.map(c =>
          typeof c === "string" ? { name: c } : c
        );
      } else if (Array.isArray(response.data)) {
        cats = response.data.map(c =>
          typeof c === "string" ? { name: c } : c
        );
      }
      setCategories(cats);
      if (cats.length === 0) {
        await addDefaultCategories();
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to fetch categories');
      createSampleCategoryData();
      setError('Failed to load real data. Showing sample data for demonstration.');
    }
  };

  const addDefaultCategories = async () => {
    try {
      const defaultCategories = ['Electronics', 'Wearables'];
      for (const categoryName of defaultCategories) {
        await axios.post(`${API_BASE}/categories`, { name: categoryName });
      }
      await fetchCategories();
      toast.success('Default categories added successfully');
    } catch (error) {
      toast.error('Failed to add default categories');
      console.error(error);
    }
  };

  // Only send allowed fields to backend
  const onSubmitProduct = async (data) => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        in_stock: data.in_stock ? parseInt(data.in_stock) : 0,
        image: data.image || null,
        images: data.images ? data.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: data.colors ? data.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
        features: data.features ? data.features.split(',').map(s => s.trim()).filter(Boolean) : [],
        specifications: data.specifications ? JSON.parse(data.specifications) : {},
      };
      await axios.post(`${API_BASE}/products`, payload);
      toast.success('Product created successfully');
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
      await axios.post(`${API_BASE}/categories`, { name: currentCategory });
      toast.success('Category added successfully');
      setCurrentCategory('');
      await fetchCategories();
    } catch (error) {
      toast.error('Failed to add category');
      console.error(error);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
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
      await axios.delete(`${API_BASE}/categories/${id}`);
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
    setValue('name', product.name || '');
    setValue('description', product.description || '');
    setValue('category', product.category || '');
    setValue('in_stock', product.in_stock || 0);
    setValue('image', product.image || '');
    setValue('images', Array.isArray(product.images) ? product.images.join(', ') : '');
    setValue('colors', Array.isArray(product.colors) ? product.colors.join(', ') : '');
    setValue('features', Array.isArray(product.features) ? product.features.join(', ') : '');
    setValue('specifications', product.specifications ? JSON.stringify(product.specifications) : '');
  };

  // Update stock using correct API and payload
  const updateStock = async (id, newStock) => {
    try {
      await axios.put(`${API_BASE}/products/${id}/stock`, { quantity: newStock });
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
        description: 'High-end smartphone with advanced features',
        category: { _id: 'cat1', name: 'Electronics' },
        in_stock: 25,
        image: 'https://via.placeholder.com/150',
        serialNumber: 'SN-2023-001'
      },
      {
        _id: 'sample2',
        name: 'Sample Smartwatch',
        description: 'Fitness tracking smartwatch',
        category: { _id: 'cat2', name: 'Wearables' },
        in_stock: 40,
        image: 'https://via.placeholder.com/150',
        serialNumber: 'SN-2023-002'
      },
      {
        _id: 'sample3',
        name: 'Sample Headphones',
        description: 'Noise cancelling wireless headphones',
        category: { _id: 'cat1', name: 'Electronics' },
        in_stock: 15,
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
              <label>Description</label>
              <textarea
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && <span className={styles.error}>{errors.description.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Category</label>
              <input
                type="text"
                {...register('category', { required: 'Category is required' })}
                placeholder="e.g. Electronics"
              />
              {errors.category && <span className={styles.error}>{errors.category.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Initial Stock</label>
              <input
                type="number"
                {...register('in_stock', {
                  required: 'Initial stock is required',
                  min: { value: 0, message: 'Stock must be positive' }
                })}
              />
              {errors.in_stock && <span className={styles.error}>{errors.in_stock.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Image URL</label>
              <input
                type="text"
                {...register('image')}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Images (comma separated URLs)</label>
              <input
                type="text"
                {...register('images')}
                placeholder="https://img1.jpg, https://img2.jpg"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Colors (comma separated)</label>
              <input
                type="text"
                {...register('colors')}
                placeholder="red, blue, green"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Features (comma separated)</label>
              <input
                type="text"
                {...register('features')}
                placeholder="Bluetooth, Waterproof"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Specifications (JSON)</label>
              <textarea
                {...register('specifications')}
                placeholder='{"weight":"200g","battery":"3000mAh"}'
              />
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
              <div key={product.product_id} className={styles.productCard}>
                <h3>{product.name}</h3>
                <p><strong>Description:</strong> {product.description}</p>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Stock:</strong> {product.in_stock}</p>
                <p><strong>Discount:</strong> {product.discount}%</p>
                <div className={styles.productActions}>
                  <button onClick={() => editProduct(product)}>Edit</button>
                  <button onClick={() => deleteProduct(product.product_id)}>Delete</button>
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
            {(Array.isArray(categories) ? categories : []).map(category => (
              <div key={category._id || category.id || category.name} className={styles.categoryItem}>
                <span>{category.name}</span>
                <button onClick={() => deleteCategory(category._id || category.id || category.name)}>Delete</button>
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
                  <th>Current Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.product_id}>
                    <td>{product.name}</td>
                    <td>{product.in_stock}</td>
                    <td>
                      <div className={styles.stockActions}>
                        <button onClick={() => {
                          const newStock = prompt(`Enter new stock for ${product.name}:`, product.in_stock);
                          if (newStock !== null && !isNaN(newStock) && newStock >= 0) {
                            updateStock(product.product_id, parseInt(newStock));
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