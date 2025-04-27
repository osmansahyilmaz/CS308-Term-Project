import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './PaymentMethods.module.css';

// Card type icons
import visaIcon from '../../assets/visa.svg';
import mastercardIcon from '../../assets/mastercard.svg';
import amexIcon from '../../assets/amex.svg';

const PaymentMethods = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCardId, setEditingCardId] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    
    const emptyCardForm = {
        card_name: '',
        card_number: '',
        card_holder: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
        is_default: false
    };
    
    const [formData, setFormData] = useState(emptyCardForm);

    // This is just a mockup - in a real application, you would integrate with a payment provider's API
    // and handle card info securely
    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            
            // In a real app, this would be an actual API call
            // Mocking the response for demo purposes
            // const response = await axios.get('/api/payment-methods', {
            //     headers: {
            //         Authorization: `Bearer ${token}`
            //     }
            // });
            
            // Simulated response
            setTimeout(() => {
                const mockPaymentMethods = [
                    {
                        id: '1',
                        card_name: 'Papara Electronic Money',
                        card_number: '**** **** **** 4574',
                        card_type: 'mastercard',
                        card_holder: 'Atakan Vardar',
                        expiry_month: '09',
                        expiry_year: '2026',
                        is_default: true
                    },
                    {
                        id: '2',
                        card_name: 'Is Bank',
                        card_number: '**** **** **** 9724',
                        card_type: 'visa',
                        card_holder: 'Atakan Vardar',
                        expiry_month: '04',
                        expiry_year: '2025',
                        is_default: false
                    }
                ];
                
                setPaymentMethods(mockPaymentMethods);
                setIsLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            setError('An error occurred while loading payment methods.');
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
    
    const formatCardNumber = (e) => {
        // Remove non-digits
        let value = e.target.value.replace(/\D/g, '');
        // Add a space after every 4 digits
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        // Limit to 19 characters (16 digits + 3 spaces)
        value = value.substring(0, 19);
        
        setFormData(prev => ({
            ...prev,
            card_number: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        
        // Validate card info
        if (formData.card_number.replace(/\s/g, '').length !== 16) {
            setError('Card number must be 16 digits.');
            return;
        }
        
        if (formData.cvv.length < 3 || formData.cvv.length > 4) {
            setError('CVV code must be 3 or 4 digits.');
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            
            // In a real app, you would make an API call
            // Simulating for demo purposes
            setTimeout(() => {
                // Simulated new card
                const newCard = {
                    id: editingCardId || Date.now().toString(),
                    card_name: formData.card_name,
                    card_number: '**** **** **** ' + formData.card_number.slice(-4),
                    card_type: getCardType(formData.card_number),
                    card_holder: formData.card_holder,
                    expiry_month: formData.expiry_month,
                    expiry_year: formData.expiry_year,
                    is_default: formData.is_default
                };
                
                if (editingCardId) {
                    // Update existing card
                    setPaymentMethods(prev => 
                        prev.map(card => card.id === editingCardId ? newCard : card)
                    );
                    setSuccessMessage('Card information successfully updated.');
                } else {
                    // Add new card
                    if (formData.is_default) {
                        // Update other cards to not be default
                        setPaymentMethods(prev => 
                            [...prev.map(card => ({ ...card, is_default: false })), newCard]
                        );
                    } else {
                        setPaymentMethods(prev => [...prev, newCard]);
                    }
                    setSuccessMessage('New card successfully added.');
                }
                
                // Reset form
                setFormData(emptyCardForm);
                setShowAddForm(false);
                setEditingCardId(null);
            }, 500);
        } catch (error) {
            console.error('Error saving payment method:', error);
            setError('An error occurred while saving card information.');
        }
    };
    
    const handleEdit = (card) => {
        // In a real app, you wouldn't populate the full card number for security reasons
        // This is just for demonstration
        setFormData({
            card_name: card.card_name,
            // We don't have the full card number, so we'd usually require the user to enter it again
            card_number: '', 
            card_holder: card.card_holder,
            expiry_month: card.expiry_month,
            expiry_year: card.expiry_year,
            cvv: '',
            is_default: card.is_default
        });
        setEditingCardId(card.id);
        setShowAddForm(true);
        setError(null);
        setSuccessMessage(null);
    };
    
    const handleDelete = (cardId) => {
        if (!window.confirm('Are you sure you want to delete this card?')) {
            return;
        }
        
        setError(null);
        setSuccessMessage(null);
        
        try {
            // In a real app, you would make an API call
            // Simulating for demo purposes
            setTimeout(() => {
                setPaymentMethods(prev => prev.filter(card => card.id !== cardId));
                
                if (editingCardId === cardId) {
                    setShowAddForm(false);
                    setEditingCardId(null);
                    setFormData(emptyCardForm);
                }
                
                setSuccessMessage('Card successfully deleted.');
            }, 300);
        } catch (error) {
            console.error('Error deleting payment method:', error);
            setError('An error occurred while deleting the card.');
        }
    };
    
    const setAsDefault = (cardId) => {
        setError(null);
        setSuccessMessage(null);
        
        try {
            // In a real app, you would make an API call
            // Simulating for demo purposes
            setTimeout(() => {
                setPaymentMethods(prev => 
                    prev.map(card => ({
                        ...card,
                        is_default: card.id === cardId
                    }))
                );
                
                setSuccessMessage('Default card updated.');
            }, 300);
        } catch (error) {
            console.error('Error setting default payment method:', error);
            setError('An error occurred while setting the default card.');
        }
    };
    
    const resetForm = () => {
        setFormData(emptyCardForm);
        setEditingCardId(null);
        setShowAddForm(false);
        setError(null);
        setSuccessMessage(null);
    };
    
    const getCardType = (cardNumber) => {
        // Remove spaces
        const cleanNumber = cardNumber.replace(/\s+/g, '');
        
        // Basic card type detection based on first digit(s)
        if (/^4/.test(cleanNumber)) return 'visa';
        if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
        if (/^3[47]/.test(cleanNumber)) return 'amex';
        
        return 'unknown';
    };
    
    const getCardIcon = (type) => {
        switch (type) {
            case 'visa':
                return <img src={visaIcon} alt="Visa" className={styles.cardIcon} />;
            case 'mastercard':
                return <img src={mastercardIcon} alt="Mastercard" className={styles.cardIcon} />;
            case 'amex':
                return <img src={amexIcon} alt="American Express" className={styles.cardIcon} />;
            default:
                return null;
        }
    };

    // Years for expiry select
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 10}, (_, i) => currentYear + i);

    return (
        <div className={styles.paymentMethods}>
            <div className={styles.header}>
                <h2>My Payment Methods</h2>
                <button 
                    type="button" 
                    className={`${styles.button} ${styles.addButton}`}
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    {showAddForm ? 'Cancel' : 'Add Card'}
                </button>
            </div>
            
            {successMessage && (
                <div className={styles.successMessage}>{successMessage}</div>
            )}
            
            {error && (
                <div className={styles.errorMessage}>{error}</div>
            )}
            
            {showAddForm && (
                <div className={styles.cardForm}>
                    <h3>{editingCardId ? 'Edit Card' : 'Add New Card'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="card_name">Card Name</label>
                            <input 
                                type="text" 
                                id="card_name" 
                                name="card_name" 
                                placeholder="Bank Card, Credit Card, etc."
                                value={formData.card_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="card_number">Card Number</label>
                            <input 
                                type="text" 
                                id="card_number" 
                                name="card_number" 
                                placeholder="XXXX XXXX XXXX XXXX"
                                value={formData.card_number}
                                onChange={formatCardNumber}
                                required
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label htmlFor="card_holder">Cardholder Name</label>
                            <input 
                                type="text" 
                                id="card_holder" 
                                name="card_holder" 
                                placeholder="First Last"
                                value={formData.card_holder}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Expiration Date</label>
                                <div className={styles.expiryInputs}>
                                    <select 
                                        name="expiry_month"
                                        value={formData.expiry_month}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Month</option>
                                        {Array.from({length: 12}, (_, i) => {
                                            const month = (i + 1).toString().padStart(2, '0');
                                            return (
                                                <option key={month} value={month}>
                                                    {month}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    <span>/</span>
                                    <select 
                                        name="expiry_year"
                                        value={formData.expiry_year}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Year</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="cvv">CVV</label>
                                <input 
                                    type="password" 
                                    id="cvv" 
                                    name="cvv" 
                                    placeholder="XXX"
                                    maxLength="4"
                                    value={formData.cvv}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input 
                                    type="checkbox" 
                                    name="is_default" 
                                    checked={formData.is_default}
                                    onChange={handleChange}
                                />
                                Set as default payment method
                            </label>
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
                                {editingCardId ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {isLoading ? (
                <div className={styles.loading}>Loading payment methods...</div>
            ) : paymentMethods.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>You don't have any payment methods yet.</p>
                    {!showAddForm && (
                        <button 
                            className={`${styles.button} ${styles.addButton}`}
                            onClick={() => setShowAddForm(true)}
                        >
                            Add Card
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.cardsList}>
                    {paymentMethods.map(card => (
                        <div key={card.id} className={styles.cardItem}>
                            {card.is_default && (
                                <span className={styles.defaultBadge}>Default</span>
                            )}
                            
                            <div className={styles.cardHeader}>
                                <div className={styles.cardTypeInfo}>
                                    {getCardIcon(card.card_type)}
                                    <h3>{card.card_name}</h3>
                                </div>
                                <div className={styles.cardActions}>
                                    <button 
                                        className={styles.editButton}
                                        onClick={() => handleEdit(card)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className={styles.deleteButton}
                                        onClick={() => handleDelete(card.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                            
                            <div className={styles.cardDetails}>
                                <div className={styles.cardNumber}>{card.card_number}</div>
                                <div className={styles.cardInfo}>
                                    <span>{card.card_holder}</span>
                                    <span>{card.expiry_month}/{card.expiry_year}</span>
                                </div>
                            </div>
                            
                            {!card.is_default && (
                                <button 
                                    className={`${styles.button} ${styles.defaultButton}`}
                                    onClick={() => setAsDefault(card.id)}
                                >
                                    Set as Default
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentMethods; 