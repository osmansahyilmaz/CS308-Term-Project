<div className={styles.profileSidebar}>
    <h2>My Account</h2>
    <ul className={styles.profileMenu}>
        <li>
            <button 
                className={`${styles.menuItem} ${activeTab === 'profile' ? styles.active : ''}`}
                onClick={() => setActiveTab('profile')}
            >
                Profile
            </button>
        </li>
        <li>
            <button 
                className={`${styles.menuItem} ${activeTab === 'orders' ? styles.active : ''}`}
                onClick={() => setActiveTab('orders')}
            >
                Order History
            </button>
        </li>
        <li>
            <button 
                className={`${styles.menuItem} ${activeTab === 'addresses' ? styles.active : ''}`}
                onClick={() => setActiveTab('addresses')}
            >
                My Addresses
            </button>
        </li>
        <li>
            <button 
                className={`${styles.menuItem} ${activeTab === 'favorites' ? styles.active : ''}`}
                onClick={() => setActiveTab('favorites')}
            >
                Favorites
            </button>
        </li>
        <li>
            <button 
                className={styles.logoutButton}
                onClick={handleLogout}
            >
                Logout
            </button>
        </li>
    </ul>
</div> 