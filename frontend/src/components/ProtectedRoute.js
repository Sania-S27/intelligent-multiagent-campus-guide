import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Renamed to ProtectedRoute
const ProtectedRoute = ({ children }) => {
  // Get our new auth flags
  const { isAuthenticated, isGuest } = useAuth();

  // VVV UPDATED LOGIC VVV
  // If the user is NOT authenticated AND NOT a guest,
  // redirect them to the homepage.
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/" />;
  }
  // ^^^ END OF UPDATED LOGIC ^^^

  // Otherwise, if they are logged in OR a guest, show the dashboard
  return children;
};

export default ProtectedRoute;