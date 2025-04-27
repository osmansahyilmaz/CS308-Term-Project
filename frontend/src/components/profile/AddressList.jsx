import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AddressList.module.css';

const API = 'http://localhost:5000/api';   

const AddressList = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);
  const [error,      setError]      = useState(null);
  const [showAddForm,setShowAddForm]= useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [successMessage,  setSuccessMessage]  = useState(null);

  const emptyAddressForm = {
    address_title:'', address_city:'', address_district:'', address_neighbourhood:'',
    address_main_street:'', address_street:'', address_building_number:'',
    address_floor:'', address_apartment_number:'', address_post_code:'',
    address_contact_phone:'', address_contact_name:'', address_contact_surname:''
  };
  const [formData, setFormData] = useState(emptyAddressForm);

  /* ───────── ilk yükleme */
  useEffect(() => { fetchAddresses(); }, []);

  /* ======================================================================== */
  /* 1.  ADRESLERİ GETİR  ---------------------------------------------------- */
  /* ======================================================================== */
  const fetchAddresses = async () => {             // 🔸 async + axios
    setIsLoading(true);  setError(null);
    try {
      const { data } = await axios.get(`${API}/addresses`, { withCredentials:true });
      setAddresses(data.addresses);
    } catch (err) {
      console.error(err);
      setError('Failed to load addresses from server.');
    } finally {
      setIsLoading(false);
    }
  };

  /* ======================================================================== */
  /* 2.  FORM DEĞİŞİKLİĞİ                                                    */
  /* ======================================================================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ======================================================================== */
  /* 3.  EKLE / GÜNCELLE  ---------------------------------------------------- */
  /* ======================================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccessMessage(null);

    try {
      if (editingAddressId) {
        /* — Güncelle — */
        await axios.put(`${API}/addresses/${editingAddressId}`, formData, { withCredentials:true });
        setSuccessMessage('Address updated.');
      } else {
        /* — Yeni ekle — */
        await axios.post(`${API}/addresses`, formData, { withCredentials:true });
        setSuccessMessage('Address added.');
      }
      resetForm();        // formu kapat
      fetchAddresses();   // listeyi yenile
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Save failed.');
    }
  };

  /* ======================================================================== */
  /* 4.  SİL  ---------------------------------------------------------------- */
  /* ======================================================================== */
  const handleDelete = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    setError(null); setSuccessMessage(null);
    try {
      await axios.delete(`${API}/addresses/${addressId}`, { withCredentials:true });   // 🔸
      setSuccessMessage('Address deleted.');
      if (editingAddressId === addressId) resetForm();
      fetchAddresses();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Delete failed.');
    }
  };

  /* edit butonuna basınca formu doldurur */
  const handleEdit = (addr) => {
    setFormData({ ...addr });             // DB alan adları zaten uygun
    setEditingAddressId(addr.address_id);
    setShowAddForm(true); setError(null); setSuccessMessage(null);
  };

  const resetForm = () => {
    setFormData(emptyAddressForm);
    setEditingAddressId(null);
    setShowAddForm(false);
  };

  const formatAddress = (a) => `${a.address_title} – ${a.address_main_street} No:${a.address_building_number} ${a.address_district}/${a.address_city}`;

  /* ─────────────────────────── JSX – listenin gösterimi ve form ──────────── */
  return (
    <div className={styles.addressList}>
      <div className={styles.header}>
        <h2>My Addresses</h2>
        <button className={`${styles.button} ${styles.addButton}`}
                onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : 'Add New Address'}
        </button>
      </div>

      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {showAddForm && (
        <div className={styles.addressForm}>
          <h3>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSubmit}>
            {/* örnek iki alan – diğer inputlarınızı aynen bırakın */}
            <div className={styles.formGroup}>
              <label>Address Title</label>
              <input name="address_title" value={formData.address_title} onChange={handleChange} required/>
            </div>
            <div className={styles.formGroup}>
              <label>City</label>
              <input name="address_city" value={formData.address_city} onChange={handleChange} required/>
            </div>
            {/* ... geri kalan tüm input alanlarınız ... */}
            <div className={styles.formActions}>
              <button type="button" onClick={resetForm} className={styles.cancelButton}>Cancel</button>
              <button type="submit" className={styles.saveButton}>
                {editingAddressId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>Loading…</div>
      ) : addresses.length === 0 ? (
        <p>No addresses yet.</p>
      ) : (
        <div className={styles.addressCards}>
          {addresses.map(a => (
            <div key={a.address_id} className={styles.addressCard}>
              <p>{formatAddress(a)}</p>
              <div className={styles.addressActions}>
                <button onClick={() => handleEdit(a)}>Edit</button>
                <button onClick={() => handleDelete(a.address_id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;
