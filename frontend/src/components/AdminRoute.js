import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAdmin, isGuest } = useAuth();

  // If the user is a guest OR a regular user (not admin)
  if (!isAdmin || isGuest) {
    // Redirect them to the homepage
    return <Navigate to="/" />;
  }

  // Otherwise, they are an admin, so show the admin page
  return children;
};

export default AdminRoute;