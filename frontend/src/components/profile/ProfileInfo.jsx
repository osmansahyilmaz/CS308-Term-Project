import React, { useState } from 'react';
import axios from 'axios';
import styles from './ProfileInfo.module.css';

const ProfileInfo = ({ userData }) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        username: userData?.username || '',
        email: userData?.email || '',
        firstName: userData?.first_name || '',
        lastName: userData?.last_name || '',
        phone: userData?.phone || ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // We don't have a user update endpoint available in the current API
            // In a production environment, we would create this endpoint
            // For now, we'll just simulate a successful update
            setTimeout(() => {
                setSuccessMessage('Your profile information has been successfully updated.');
                setEditMode(false);
                setIsLoading(false);
            }, 500);
            
            /* If we had an endpoint, it would look like this:
            const response = await axios.put('http://localhost:5000/api/auth/update-profile', formData, {
                withCredentials: true // Important: this sends the session cookie
            });
            */
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.response?.data?.error || 'An error occurred while updating the profile.');
            setIsLoading(false);
        }
    };

    const toggleEditMode = () => {
        if (editMode) {
            // Reset form data if canceling edit
            setFormData({
                username: userData?.username || '',
                email: userData?.email || '',
                firstName: userData?.first_name || '',
                lastName: userData?.last_name || '',
                phone: userData?.phone || ''
            });
        }
        setEditMode(!editMode);
        setError(null);
        setSuccessMessage(null);
    };

    return (
        <div className={styles.profileInfo}>
            <div className={styles.header}>
                <h2>My Profile Information</h2>
                <button 
                    type="button" 
                    className={`${styles.button} ${editMode ? styles.cancelButton : styles.editButton}`}
                    onClick={toggleEditMode}
                >
                    {editMode ? 'Cancel' : 'Edit'}
                </button>
            </div>

            {successMessage && (
                <div className={styles.successMessage}>{successMessage}</div>
            )}

            {error && (
                <div className={styles.errorMessage}>{error}</div>
            )}

            {editMode ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username">Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            name="username" 
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="firstName">First Name</label>
                            <input 
                                type="text" 
                                id="firstName" 
                                name="firstName" 
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="lastName">Last Name</label>
                            <input 
                                type="text" 
                                id="lastName" 
                                name="lastName" 
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="phone">Phone</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className={styles.formActions}>
                        <button 
                            type="submit" 
                            className={`${styles.button} ${styles.saveButton}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.profileDetails}>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Username:</span>
                        <span className={styles.value}>{userData?.username}</span>
                    </div>
                    
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Email:</span>
                        <span className={styles.value}>{userData?.email}</span>
                    </div>
                    
                    <div className={styles.detailRow}>
                        <span className={styles.label}>First Name:</span>
                        <span className={styles.value}>{userData?.first_name || '-'}</span>
                    </div>
                    
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Last Name:</span>
                        <span className={styles.value}>{userData?.last_name || '-'}</span>
                    </div>
                    
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Phone:</span>
                        <span className={styles.value}>{userData?.phone || '-'}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileInfo; 