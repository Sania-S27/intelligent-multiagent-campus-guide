import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'; 
import AdminRoute from './components/AdminRoute'; // VVV 1. IMPORT AdminRoute VVV
import AdminDashboard from './components/AdminDashboard'; // VVV 2. IMPORT AdminDashboard VVV
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" style={{height: '100%'}}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* User & Guest Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* VVV 3. ADD THE NEW ADMIN-ONLY ROUTE VVV */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            {/* ^^^ END OF NEW ROUTE ^^^ */}
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;