import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // We'll add loginAsGuest to this

const Home = () => {
  const navigate = useNavigate();
  const { loginAsGuest } = useAuth(); // We will create this function next

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/dashboard');
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>BIET Campus Guide</h1>
        <p>Your Intelligent Multi-Agent Virtual Campus Assistant</p>
      </header>

      <main className="home-main">
        {/* Top row for login */}
        <div className="home-grid">
          <div className="home-card login-card">
            <h2>For Students & Visitors</h2>
            <p>Navigate campus, discover events, and get instant help</p>
            <button 
              className="home-button primary" 
              onClick={() => navigate('/login')}
            >
              User Login
            </button>
            
            {/* NEW GUEST BUTTON */}
            <button 
              className="home-button secondary" 
              onClick={handleGuestLogin}
            >
              Continue as Guest
            </button>
          </div>

          <div className="home-card login-card">
            <h2>For Administrators</h2>
            <p>Manage college info, events, and user data</p>
            <button 
              className="home-button secondary" 
              onClick={() => navigate('/login')} // All logins go to the same page
            >
              Admin Login
            </button>
          </div>
        </div>

        {/* Bottom row for features */}
        <div className="home-grid">
          <div className="home-card feature-card">
            <h3>Interactive Maps</h3>
            <p>Real-time campus navigation with Mapbox integration</p>
          </div>
          <div className="home-card feature-card">
            <h3>Event Management</h3>
            <p>Discover and register for campus events</p>
          </div>
          <div className="home-card feature-card">
            <h3>Smart Assistant</h3>
            <p>Multi-agent system for instant campus support</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;