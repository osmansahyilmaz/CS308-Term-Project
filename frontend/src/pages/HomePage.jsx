// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Welcome to the Online Store</h1>
            <p>This is the home page.</p>
            <div style={{ marginTop: '2rem' }}>
                <Link to="/login">
                    <button style={{ margin: '0 1rem', padding: '1rem 2rem' }}>Login</button>
                </Link>
                <Link to="/register">
                    <button style={{ margin: '0 1rem', padding: '1rem 2rem' }}>Register</button>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;
