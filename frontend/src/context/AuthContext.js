import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  // VVV 1. ADD NEW STATE FOR IN-APP MESSAGE VVV
  const [appMessage, setAppMessage] = useState(null); 
  // ^^^ END NEW STATE ^^^

  useEffect(() => {
    // Check if token and user data are in local storage on initial load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Clear any temporary login message when refreshing
      setAppMessage(null); 
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await loginUser(formData);
      
      const { access_token, user: userData } = response.data;

      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // VVV 2. ADD IN-APP NOTIFICATION ON SUCCESS VVV
      setAppMessage({
          type: 'success', 
          text: `Welcome back, ${userData.name}!`,
          // Add a temporary flag to indicate recent login
          //showNewEvents: true 
      });
      // ^^^ END IN-APP NOTIFICATION ^^^
      
      return userData.role; 
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };
  
  const loginAsGuest = () => {
    const guestUser = { name: 'Guest', role: 'guest' };
    setUser(guestUser);
    setAppMessage({
        type: 'info', 
        text: `Welcome, Guest! Navigate the map freely.`,
        showNewEvents: false
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('chat_history');
    setAppMessage(null);
  };

  const authContextValue = {
    user,
    token,
    login,
    logout,
    loginAsGuest,
    isAuthenticated: !!token,
    isGuest: user?.role === 'guest',
    isAdmin: user?.role === 'admin',
    
    // VVV 3. EXPOSE AND CONTROL THE MESSAGE VVV
    appMessage,
    clearAppMessage: () => setAppMessage(null) 
    // ^^^ END EXPOSE MESSAGE ^^^
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};