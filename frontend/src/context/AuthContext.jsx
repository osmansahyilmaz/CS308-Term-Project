import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the auth context
const AuthContext = createContext();

// Hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Map role_id to role string
const getRoleFromId = (roleId) => {
  // Convert to number to ensure comparison works
  const id = Number(roleId);
  
  switch (id) {
    case 0:
      return 'admin';
    case 1:
      return 'customer';
    case 2:
      return 'productManager';
    case 3:
      return 'salesManager';
    default:
      return 'customer';
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to fetch the user profile on initial load
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching user profile...');
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          withCredentials: true,
        });
        
        console.log('Profile API response:', res.data);
        
        if (res.data && res.data.user) {
          setCurrentUser(res.data.user);
          
          // Convert role_id to role string
          const roleString = getRoleFromId(res.data.user.role_id);
          
          console.log('Setting user role to:', roleString, '(from role_id:', res.data.user.role_id, ')');
          setUserRole(roleString);
          setIsAuthenticated(true);
        } else {
          console.log('No user data in response');
          setCurrentUser(null);
          setUserRole(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setCurrentUser(null);
        setUserRole(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        { withCredentials: true }
      );
      
      console.log('Login response:', response.data);
      
      if (response.data && response.data.user) {
        setCurrentUser(response.data.user);
        
        // Convert role_id to role string
        const roleString = getRoleFromId(response.data.user.role_id);
        
        console.log('Setting role after login:', roleString, '(from role_id:', response.data.user.role_id, ')');
        setUserRole(roleString);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/auth/logout',
        {},
        { withCredentials: true }
      );
      setCurrentUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Logout failed'
      };
    }
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    console.log('Checking for role:', role, 'Current role:', userRole);
    if (!userRole) return false;
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  };

  // Auth context value
  const value = {
    currentUser,
    userRole,
    isAuthenticated,
    loading,
    login,
    logout,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 