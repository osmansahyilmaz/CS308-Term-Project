import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AddressList.module.css';

const AddressList = () => {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const emptyAddressForm = {
        address_title: '',
        address_city: '',
        address_district: '',
        address_neighbourhood: '',
        address_main_street: '',
        address_street: '',
        address_building_number: '',
        address_floor: '',
        address_apartment_number: '',
        address_post_code: '',
        address_contact_phone: '',
        address_contact_name: '',
        address_contact_surname: ''
    };
    
    const [formData, setFormData] = useState(emptyAddressForm);

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Get addresses from localStorage instead of API
            const savedAddressesString = localStorage.getItem('savedAddresses');
            let savedAddresses = savedAddressesString ? JSON.parse(savedAddressesString) : [];
            
            // Convert saved addresses to the format expected by the component
            const formattedAddresses = savedAddresses.map(addr => ({
                address_id: addr.id,
                address_title: addr.title,
                address_city: addr.city,
                address_district: addr.district,
                address_neighbourhood: addr.neighbourhood || '',
                address_main_street: addr.street || '',
                address_street: addr.street || '',
                address_building_number: addr.buildingNumber || '',
                address_floor: addr.floor || '',
                address_apartment_number: addr.apartmentNumber || '',
                address_post_code: addr.postCode || '',
                address_contact_phone: addr.phone || '',
                address_contact_name: addr.recipientName ? addr.recipientName.split(' ')[0] : '',
                address_contact_surname: addr.recipientName ? addr.recipientName.split(' ')[1] || '' : ''
            }));
            
            setAddresses(formattedAddresses);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setError('An error occurred while loading addresses.');
            setIsLoading(false);
        }
    };
    
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        
        try {
            // Get existing addresses from localStorage
            const savedAddressesString = localStorage.getItem('savedAddresses');
            let savedAddresses = savedAddressesString ? JSON.parse(savedAddressesString) : [];
            
            // Convert form data to simpler address format for localStorage
            const addressToSave = {
                id: editingAddressId || 'addr-' + Date.now(),
                title: formData.address_title,
                recipientName: `${formData.address_contact_name} ${formData.address_contact_surname}`.trim(),
                city: formData.address_city,
                district: formData.address_district,
                neighbourhood: formData.address_neighbourhood,
                street: formData.address_main_street || formData.address_street,
                buildingNumber: formData.address_building_number,
                floor: formData.address_floor,
                apartmentNumber: formData.address_apartment_number,
                postCode: formData.address_post_code,
                phone: formData.address_contact_phone
            };
            
            if (editingAddressId) {
                // Update existing address
                savedAddresses = savedAddresses.map(addr => 
                    addr.id === editingAddressId ? addressToSave : addr
                );
                setSuccessMessage('Address updated successfully.');
            } else {
                // Add new address
                savedAddresses.push(addressToSave);
                setSuccessMessage('Address added successfully.');
            }
            
            // Save back to localStorage
            localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
            
            setFormData(emptyAddressForm);
            setShowAddForm(false);
            setEditingAddressId(null);
            fetchAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            setError('An error occurred while saving the address.');
        }
    };
    
    const handleEdit = (address) => {
        setFormData({
            address_title: address.address_title || '',
            address_city: address.address_city || '',
            address_district: address.address_district || '',
            address_neighbourhood: address.address_neighbourhood || '',
            address_main_street: address.address_main_street || '',
            address_street: address.address_street || '',
            address_building_number: address.address_building_number || '',
            address_floor: address.address_floor?.toString() || '',
            address_apartment_number: address.address_apartment_number || '',
            address_post_code: address.address_post_code?.toString() || '',
            address_contact_phone: address.address_contact_phone || '',
            address_contact_name: address.address_contact_name || '',
            address_contact_surname: address.address_contact_surname || ''
        });
        setEditingAddressId(address.address_id);
        setShowAddForm(true);
        setError(null);
        setSuccessMessage(null);
    };
    
    const handleDelete = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) {
            return;
        }
        
        setError(null);
        setSuccessMessage(null);
        
        try {
            // Get existing addresses from localStorage
            const savedAddressesString = localStorage.getItem('savedAddresses');
            let savedAddresses = savedAddressesString ? JSON.parse(savedAddressesString) : [];
            
            // Filter out the address to delete
            savedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
            
            // Save back to localStorage
            localStorage.setItem('savedAddresses', JSON.stringify(savedAddresses));
            
            setSuccessMessage('Address deleted successfully.');
            
            if (editingAddressId === addressId) {
                setShowAddForm(false);
                setEditingAddressId(null);
                setFormData(emptyAddressForm);
            }
            
            fetchAddresses();
        } catch (error) {
            console.error('Error deleting address:', error);
            setError('An error occurred while deleting the address.');
        }
    };
    
    const setAsDefault = async (addressId) => {
        setError('This feature is not available yet.');
        setTimeout(() => {
            setError(null);
        }, 3000);
    };
    
    const resetForm = () => {
        setFormData(emptyAddressForm);
        setEditingAddressId(null);
        setShowAddForm(false);
        setError(null);
        setSuccessMessage(null);
    };

    const formatAddress = (address) => {
        return {
            id: address.address_id,
            title: address.address_title,
            recipientName: `${address.address_contact_name} ${address.address_contact_surname}`,
            line1: `${address.address_neighbourhood} Mah. ${address.address_main_street || ''} ${address.address_street || ''}`,
            line2: `No:${address.address_building_number}, ${address.address_floor ? `Kat:${address.address_floor}` : ''} ${address.address_apartment_number ? `Daire:${address.address_apartment_number}` : ''}`,
            district: address.address_district,
            city: address.address_city,
            postCode: address.address_post_code,
            phone: address.address_contact_phone
        };
    };

    return (
        <div className={styles.addressList}>
            <div className={styles.header}>
                <h2>My Addresses</h2>
                <button 
                    type="button" 
                    className={`${styles.button} ${styles.addButton}`}
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : 'Add New Address'}
                </button>
            </div>
            
            {successMessage && (
                <div className={styles.successMessage}>{successMessage}</div>
            )}
            
            {error && (
                <div className={styles.errorMessage}>{error}</div>
            )}
            
            {showAddForm && (
                <div className={styles.addressForm}>
                    <h3>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="address_title">Address Title</label>
                            <input 
                                type="text" 
                                id="address_title" 
                                name="address_title" 
                                placeholder="e.g. Home, Work"
                                value={formData.address_title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="address_contact_name">Name</label>
                                <input 
                                    type="text" 
                                    id="address_contact_name" 
                                    name="address_contact_name" 
                                    value={formData.address_contact_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="address_contact_surname">Surname</label>
                                <input 
                                    type="text" 
                                    id="address_contact_surname" 
                                    name="address_contact_surname" 
                                    value={formData.address_contact_surname}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="address_city">City</label>
                                <input 
                                    type="text" 
                                    id="address_city" 
                                    name="address_city" 
                                    value={formData.address_city}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="address_district">District</label>
                                <input 
                                    type="text" 
                                    id="address_district" 
                                    name="address_district" 
                                    value={formData.address_district}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="address_neighbourhood">Neighbourhood</label>
                            <input 
                                type="text" 
                                id="address_neighbourhood" 
                                name="address_neighbourhood" 
                                value={formData.address_neighbourhood}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="address_main_street">Street</label>
                            <input 
                                type="text" 
                                id="address_main_street" 
                                name="address_main_street" 
                                value={formData.address_main_street}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="address_street">Street</label>
                            <input 
                                type="text" 
                                id="address_street" 
                                name="address_street" 
                                value={formData.address_street}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="address_building_number">Building Number</label>
                                <input 
                                    type="text" 
                                    id="address_building_number" 
                                    name="address_building_number" 
                                    value={formData.address_building_number}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="address_floor">Floor (optional)</label>
                                <input 
                                    type="number" 
                                    id="address_floor" 
                                    name="address_floor" 
                                    value={formData.address_floor}
                                    onChange={handleChange}
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="address_apartment_number">Apartment Number (optional)</label>
                                <input 
                                    type="text" 
                                    id="address_apartment_number" 
                                    name="address_apartment_number" 
                                    value={formData.address_apartment_number}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="address_post_code">Post Code</label>
                            <input 
                                type="number" 
                                id="address_post_code" 
                                name="address_post_code" 
                                value={formData.address_post_code}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="address_contact_phone">Phone</label>
                            <input 
                                type="tel" 
                                id="address_contact_phone" 
                                name="address_contact_phone" 
                                placeholder="5xx xxx xx xx"
                                value={formData.address_contact_phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className={styles.formActions}>
                            <button 
                                type="button" 
                                className={`${styles.button} ${styles.cancelButton}`}
                                onClick={resetForm}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className={`${styles.button} ${styles.saveButton}`}
                            >
                                {editingAddressId ? 'Update Address' : 'Save Address'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {isLoading ? (
                <div className={styles.loading}>Loading addresses...</div>
            ) : addresses.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>You don't have any saved addresses yet.</p>
                    {!showAddForm && (
                        <button 
                            className={`${styles.button} ${styles.addButton}`}
                            onClick={() => setShowAddForm(true)}
                        >
                            Add Your First Address
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.addressCards}>
                    {addresses.map(address => {
                        const formattedAddress = formatAddress(address);
                        return (
                            <div key={address.address_id} className={styles.addressCard}>
                                <div className={styles.addressHeader}>
                                    <h3>{formattedAddress.title}</h3>
                                    <div className={styles.addressActions}>
                                        <button 
                                            className={styles.editButton}
                                            onClick={() => handleEdit(address)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className={styles.deleteButton}
                                            onClick={() => handleDelete(address.address_id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                
                                <div className={styles.addressDetails}>
                                    <p className={styles.recipientName}>{formattedAddress.recipientName}</p>
                                    <p>{formattedAddress.line1}</p>
                                    <p>{formattedAddress.line2}</p>
                                    <p>{formattedAddress.district}, {formattedAddress.city}, {formattedAddress.postCode}</p>
                                    <p className={styles.phone}>Phone: {formattedAddress.phone}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AddressList; 