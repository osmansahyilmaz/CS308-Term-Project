import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './CheckoutPage.module.css';
import axios from 'axios';

// Import card type icons (these should be available in your assets folder)
import visaIcon from '../assets/visa.svg';
import mastercardIcon from '../assets/mastercard.svg';
import amexIcon from '../assets/amex.svg';

// Base URL for backend API
const BASE_URL = 'http://localhost:5000/api';

function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    recipientName: '',
    city: '',
    district: '',
    street: '',
    buildingNumber: '',
    apartmentNumber: '',
    postCode: '',
    phone: ''
  });
  
  // Payment method states
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const [newCard, setNewCard] = useState({
    cardName: '',
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCart = () => {
      try {
        // If Buy Now items are passed via navigation state, use them directly
        if (location.state && location.state.buyNowItems) {
          const buyNowItems = location.state.buyNowItems;
          setCartItems(buyNowItems);
          const total = buyNowItems.reduce(
            (acc, item) => acc + item.price * (item.quantity || 1),
            0
          );
          setTotalPrice(total);
          setLoading(false);
          return;
        }

        // Otherwise use full cart from localStorage
        const cartString = localStorage.getItem("cart");
        const cartData = cartString ? JSON.parse(cartString) : [];
        setCartItems(cartData);
        
        const total = cartData.reduce(
          (acc, item) => acc + item.price * (item.quantity || 1),
          0
        );
        setTotalPrice(total);
        setLoading(false);
      } catch (err) {
        setMessage('Failed to load cart.');
        setLoading(false);
      }
    };
    
    // Get saved addresses (first try backend, fallback to localStorage)
    const fetchAddresses = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/addresses`, { withCredentials: true });

        // Map backend address format to frontend format
        const addresses = (res.data.addresses || []).map(addr => ({
          id: addr.address_id,
          title: addr.address_title,
          recipientName: `${addr.address_contact_name} ${addr.address_contact_surname}`.trim(),
          city: addr.address_city,
          district: addr.address_district,
          street: addr.address_street || addr.address_main_street || '',
          buildingNumber: addr.address_building_number,
          apartmentNumber: addr.address_apartment_number,
          postCode: addr.address_post_code,
          phone: addr.address_contact_phone
        }));

        // Persist to localStorage for legacy components
        localStorage.setItem('savedAddresses', JSON.stringify(addresses));

        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          setSelectedAddressId(addresses[0].id);
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
          setSelectedAddressId('');
        }
      } catch (err) {
        console.error('Error loading addresses from backend, falling back to localStorage:', err);
        try {
          const addressesString = localStorage.getItem('savedAddresses');
          let addresses = addressesString ? JSON.parse(addressesString) : [];
          if (!Array.isArray(addresses)) addresses = [];
          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            setSelectedAddressId(addresses[0].id);
            setShowNewAddressForm(false);
          } else {
            setShowNewAddressForm(true);
            setSelectedAddressId('');
          }
        } catch (localErr) {
          console.error('Error loading addresses from localStorage:', localErr);
        }
      }
    };
    
    // Get saved payment methods
    const fetchPaymentMethods = () => {
      try {
        // For now, we'll simulate fetching cards from localStorage
        // In a real app, you might get these from an API
        
        // Check if there are saved cards in localStorage
        const savedCardsString = localStorage.getItem('savedCards');
        let cards = savedCardsString ? JSON.parse(savedCardsString) : [];
        
        // If no cards in localStorage, use sample data for demonstration
        if (!cards || !Array.isArray(cards) || cards.length === 0) {
          // Sample cards for demonstration
          cards = [
            {
              id: '1',
              cardName: 'Papara Electronic Money',
              cardNumber: '**** **** **** 4574',
              cardType: 'mastercard',
              cardHolder: 'Atakan Vardar',
              expiryMonth: '09',
              expiryYear: '2026',
              isDefault: true
            },
            {
              id: '2',
              cardName: 'Is Bank',
              cardNumber: '**** **** **** 9724',
              cardType: 'visa',
              cardHolder: 'Atakan Vardar',
              expiryMonth: '04',
              expiryYear: '2025',
              isDefault: false
            }
          ];
          
          // Save sample cards to localStorage for future use
          localStorage.setItem('savedCards', JSON.stringify(cards));
        }
        
        setSavedCards(cards);
        
        // If there's at least one card, select it by default
        if (cards.length > 0) {
          // Find default card or use first card
          const defaultCard = cards.find(card => card.isDefault) || cards[0];
          setSelectedCardId(defaultCard.id);
          setShowNewCardForm(false);
        } else {
          setShowNewCardForm(true);
          setSelectedCardId('');
        }
      } catch (err) {
        console.error('Error loading saved payment methods:', err);
      }
    };
    
    fetchCart();
    fetchAddresses();
    fetchPaymentMethods();
  }, [location.state]);

  const handlePurchase = async () => {
    try {
      setMessage('');

      // 1) Validate address & payment selections
      if (!selectedAddressId && !showNewAddressForm) {
        setMessage('Please select or enter a shipping address.');
        return;
      }
      if (!selectedCardId && !showNewCardForm) {
        setMessage('Please select or enter payment information.');
        return;
      }

      // If user entered a new card, perform basic validation (front-end only)
      if (showNewCardForm) {
        if (!newCard.cardNumber || !newCard.cardHolder || !newCard.expiryMonth || !newCard.expiryYear || !newCard.cvv) {
          setMessage('Please complete all payment information fields.');
          return;
        }
      }

      // 2) If user created a new address, save it via backend first
      let backendAddressId = selectedAddressId;
      if (showNewAddressForm) {
        // Basic validation
        if (!newAddress.recipientName || !newAddress.city || !newAddress.street || !newAddress.phone) {
          setMessage('Please complete all required address fields.');
          return;
        }

        // Split recipient name into first + surname for backend schema
        const nameParts = newAddress.recipientName.trim().split(' ');
        const contactName = nameParts.shift();
        const contactSurname = nameParts.join(' ');

        const addressPayload = {
          address_title: newAddress.title || 'Shipping',
          address_city: newAddress.city,
          address_district: newAddress.district,
          address_neighbourhood: '',
          address_main_street: '',
          address_street: newAddress.street,
          address_building_number: newAddress.buildingNumber,
          address_floor: '',
          address_apartment_number: newAddress.apartmentNumber,
          address_post_code: newAddress.postCode,
          address_contact_phone: newAddress.phone,
          address_contact_name: contactName,
          address_contact_surname: contactSurname
        };

        const res = await axios.post(`${BASE_URL}/addresses`, addressPayload, { withCredentials: true });
        backendAddressId = res.data.address.address_id;
      }

      // 3) Sync current cart items to backend cart (session or user based)
      await Promise.all(
        cartItems.map(item =>
          axios.post(
            `${BASE_URL}/cart/add`,
            { productId: item.product_id, quantity: item.quantity || 1 },
            { withCredentials: true }
          )
        )
      );

      // 4) Place the order using backend controller
      const orderRes = await axios.post(`${BASE_URL}/orders`, {}, { withCredentials: true });

      // 5) Provide feedback & clean up local cart
      setMessage('Purchase successful! Your order has been placed.');
      localStorage.setItem('cart', JSON.stringify([]));
      setCartItems([]);
      setTotalPrice(0);

      // 6) Optionally build order object for invoice page (using local data)
      const orderForInvoice = {
        invoiceNumber: `INV-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        addressId: backendAddressId,
        items: cartItems.map(i => ({ description: i.name, quantity: i.quantity || 1, price: i.price })),
      };

      navigate('/checkout-success', { state: { order: orderForInvoice, backendOrderId: orderRes.data.orderId } });

    } catch (error) {
      console.error('Error completing purchase:', error.response?.data || error.message);
      const errMsg = error.response?.data?.error || 'Failed to complete purchase.';
      setMessage(errMsg);
    }
  };

  const handleAddressChange = (e) => {
    setSelectedAddressId(e.target.value);
    setShowNewAddressForm(e.target.value === 'new');
  };
  
  const handleNewAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({
      ...newAddress,
      [name]: value
    });
  };
  
  // Handle card form changes
  const handleNewCardChange = (e) => {
    const { name, value } = e.target;
    setNewCard({
      ...newCard,
      [name]: value
    });
  };
  
  // Format card number with spaces
  const formatCardNumber = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    value = value.substring(0, 19);
    
    setNewCard({
      ...newCard,
      cardNumber: value
    });
  };
  
  // Detect card type based on first digits
  const getCardType = (cardNumber) => {
    const cleanNumber = cardNumber.replace(/\s+/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    
    return 'unknown';
  };
  
  // Get card icon based on type
  const getCardIcon = (type) => {
    switch (type) {
      case 'visa':
        return <img src={visaIcon} alt="Visa" className={styles.cardTypeIcon} />;
      case 'mastercard':
        return <img src={mastercardIcon} alt="Mastercard" className={styles.cardTypeIcon} />;
      case 'amex':
        return <img src={amexIcon} alt="American Express" className={styles.cardTypeIcon} />;
      default:
        return null;
    }
  };

  if (loading) return <p style={{ padding: '2rem' }}>Loading checkout...</p>;

  return (
    <div className={styles.pageBackground}>
      <div className={styles.checkoutContainer}>
        <div className={styles.leftColumn}>
          <h1 className={styles.checkoutTitle}>Checkout</h1>
          {cartItems.length === 0 ? (
            <p>Your cart is empty. Please add items before checkout.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.product_id} className={styles.checkoutItem}>
                <div className={styles.itemImageWrapper}>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemDetails}>
                    {item.quantity} x ${Number(item.price).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
          <h2 className={styles.totalPrice}>
            Total: <span>${totalPrice.toFixed(2)}</span>
          </h2>
        </div>

        <div className={styles.rightColumn}>
          {/* Shipping Address Section */}
          <h2 className={styles.sectionTitle}>Shipping Address</h2>
          <div className={styles.addressSection}>
            {savedAddresses.length > 0 ? (
              <>
                <div className={styles.savedAddressesHeader}>
                  <h3>Your Saved Addresses</h3>
                  {!showNewAddressForm && (
                    <button 
                      className={styles.addNewButton}
                      onClick={() => {
                        setShowNewAddressForm(true);
                        setSelectedAddressId('');
                      }}
                    >
                      + Add New
                    </button>
                  )}
                </div>
                
                {showNewAddressForm ? (
                  <div className={styles.addressSelect}>
                    <button 
                      className={styles.backToSavedButton}
                      onClick={() => {
                        setShowNewAddressForm(false);
                        // Select the first address if none is selected
                        if (!selectedAddressId && savedAddresses.length > 0) {
                          setSelectedAddressId(savedAddresses[0].id);
                        }
                      }}
                    >
                      ← Back to Saved Addresses
                    </button>
                  </div>
                ) : (
                  <div className={styles.addressCardsContainer}>
                    {savedAddresses.map(addr => (
                      <div 
                        key={addr.id}
                        className={`${styles.addressCard} ${selectedAddressId === addr.id ? styles.selectedCard : ''}`}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <input
                          type="radio"
                          name="addressSelect"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                        />
                        <div className={styles.addressCardContent}>
                          <h4>{addr.title}</h4>
                          <p>{addr.recipientName}</p>
                          <p>{addr.street}, {addr.buildingNumber} {addr.apartmentNumber ? `Apt ${addr.apartmentNumber}` : ''}</p>
                          <p>{addr.district}, {addr.city} {addr.postCode}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noSavedAddresses}>
                <p>You don't have any saved addresses yet.</p>
              </div>
            )}
            
            {showNewAddressForm && (
              <div className={styles.newAddressForm}>
                <h3>New Address</h3>
                <div className={styles.inputGroup}>
                  <label>Address Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    placeholder="Home, Work, etc."
                    value={newAddress.title}
                    onChange={handleNewAddressChange}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Recipient Name*</label>
                  <input 
                    type="text" 
                    name="recipientName" 
                    placeholder="Full Name"
                    value={newAddress.recipientName}
                    onChange={handleNewAddressChange}
                    required
                  />
                </div>
                
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>City*</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={newAddress.city}
                      onChange={handleNewAddressChange}
                      required
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label>District*</label>
                    <input 
                      type="text" 
                      name="district" 
                      value={newAddress.district}
                      onChange={handleNewAddressChange}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Street/Road*</label>
                  <input 
                    type="text" 
                    name="street" 
                    value={newAddress.street}
                    onChange={handleNewAddressChange}
                    required
                  />
                </div>
                
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>Building No*</label>
                    <input 
                      type="text" 
                      name="buildingNumber" 
                      value={newAddress.buildingNumber}
                      onChange={handleNewAddressChange}
                      required
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label>Apartment No</label>
                    <input 
                      type="text" 
                      name="apartmentNumber" 
                      value={newAddress.apartmentNumber}
                      onChange={handleNewAddressChange}
                    />
                  </div>
                </div>
                
                <div className={styles.inputRow}>
                  <div className={styles.inputGroup}>
                    <label>Postal Code*</label>
                    <input 
                      type="text" 
                      name="postCode" 
                      value={newAddress.postCode}
                      onChange={handleNewAddressChange}
                      required
                    />
                  </div>
                  
                  <div className={styles.inputGroup}>
                    <label>Phone*</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={newAddress.phone}
                      onChange={handleNewAddressChange}
                      required
                    />
                  </div>
                </div>
                
                <p className={styles.formNote}>* Required fields</p>
              </div>
            )}
          </div>
          
          {/* Payment Section */}
          <h2 className={styles.paymentTitle}>Payment Info</h2>
          <div className={styles.paymentSection}>
            {savedCards.length > 0 ? (
              <>
                <div className={styles.savedCardsHeader}>
                  <h3>Your Saved Cards</h3>
                  {!showNewCardForm && (
                    <button 
                      className={styles.addNewButton}
                      onClick={() => {
                        setShowNewCardForm(true);
                        setSelectedCardId('');
                      }}
                    >
                      + Add New Card
                    </button>
                  )}
                </div>
                
                {showNewCardForm ? (
                  <div className={styles.cardSelect}>
                    <button 
                      className={styles.backToSavedButton}
                      onClick={() => {
                        setShowNewCardForm(false);
                        // Select the default or first card if none is selected
                        if (!selectedCardId && savedCards.length > 0) {
                          const defaultCard = savedCards.find(card => card.isDefault) || savedCards[0];
                          setSelectedCardId(defaultCard.id);
                        }
                      }}
                    >
                      ← Back to Saved Cards
                    </button>
                  </div>
                ) : (
                  <div className={styles.cardCardsContainer}>
                    {savedCards.map(card => (
                      <div 
                        key={card.id}
                        className={`${styles.paymentCard} ${selectedCardId === card.id ? styles.selectedCard : ''}`}
                        onClick={() => setSelectedCardId(card.id)}
                      >
                        <input
                          type="radio"
                          name="cardSelect"
                          checked={selectedCardId === card.id}
                          onChange={() => setSelectedCardId(card.id)}
                        />
                        <div className={styles.paymentCardContent}>
                          <div className={styles.cardHeader}>
                            {getCardIcon(card.cardType)}
                            <h4>{card.cardName}</h4>
                            {card.isDefault && <span className={styles.defaultBadge}>Default</span>}
                          </div>
                          <p className={styles.cardNumber}>{card.cardNumber}</p>
                          <p className={styles.cardDetails}>
                            <span>{card.cardHolder}</span>
                            <span>{card.expiryMonth}/{card.expiryYear}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.noSavedCards}>
                <p>You don't have any saved payment methods yet.</p>
              </div>
            )}
            
            {showNewCardForm && (
              <div className={styles.newCardForm}>
                <h3>New Payment Method</h3>
                <div className={styles.inputGroup}>
                  <label>Card Name</label>
                  <input 
                    type="text" 
                    name="cardName" 
                    placeholder="My Credit Card"
                    value={newCard.cardName}
                    onChange={handleNewCardChange}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Card Number*</label>
                  <input 
                    type="text" 
                    name="cardNumber" 
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={newCard.cardNumber}
                    onChange={formatCardNumber}
                    required
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label>Cardholder Name*</label>
                  <input 
                    type="text" 
                    name="cardHolder" 
                    placeholder="John Doe"
                    value={newCard.cardHolder}
                    onChange={handleNewCardChange}
                    required
                  />
                </div>
                
                <div className={styles.inputRow}>
                  <div>
                    <label>Expiration*</label>
                    <div className={styles.expiryInputs}>
                      <select 
                        name="expiryMonth"
                        value={newCard.expiryMonth}
                        onChange={handleNewCardChange}
                        required
                      >
                        <option value="">Month</option>
                        {Array.from({length: 12}, (_, i) => {
                          const month = (i + 1).toString().padStart(2, '0');
                          return (
                            <option key={month} value={month}>{month}</option>
                          );
                        })}
                      </select>
                      <span>/</span>
                      <select 
                        name="expiryYear"
                        value={newCard.expiryYear}
                        onChange={handleNewCardChange}
                        required
                      >
                        <option value="">Year</option>
                        {Array.from({length: 10}, (_, i) => {
                          const year = (new Date().getFullYear() + i).toString();
                          return (
                            <option key={year} value={year}>{year}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label>CVV*</label>
                    <input 
                      type="password" 
                      name="cvv" 
                      placeholder="XXX"
                      maxLength="4"
                      value={newCard.cvv}
                      onChange={handleNewCardChange}
                      required
                    />
                  </div>
                </div>
                
                <p className={styles.formNote}>* Required fields</p>
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.backButton} onClick={() => navigate('/cart')}>
              ← Back to Cart
            </button>
            <button 
              className={styles.purchaseButton} 
              onClick={handlePurchase}
              disabled={cartItems.length === 0}
            >
              Complete Purchase
            </button>
          </div>

          {message && <p className={styles.messageText}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;

