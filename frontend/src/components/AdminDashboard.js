import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminManage from './admin/AdminManage'; // <-- 1. IMPORT NEW COMPONENT
// Import the new components we just made
import AdminEvents from './admin/AdminEvents';
import AdminFAQs from './admin/AdminFAQs';
import AdminRegistrations from './admin/AdminRegistrations';

// Define our tabs
const TABS = {
  EVENTS: 'Create Event',
  FAQS: 'Create & Review FAQs',
  REGISTRATIONS: 'Event Registrations',
  MANAGE: 'Site Management' // <-- 2. ADD NEW TAB
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State for the active tab
  const [activeTab, setActiveTab] = useState(TABS.EVENTS);
  
  // State for the notification message
  const [message, setMessage] = useState('');

  // Shows a message and clears it after 3 seconds
  const showMessage = (msg, isError = false) => {
    setMessage({ text: msg, error: isError });
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to homepage
  };

  // Render the correct component based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case TABS.EVENTS:
        return <AdminEvents showMessage={showMessage} />;
      case TABS.FAQS:
        return <AdminFAQs showMessage={showMessage} />;
      case TABS.REGISTRATIONS:
        return <AdminRegistrations />;
      case TABS.MANAGE: // <-- 3. ADD RENDER CASE
        return <AdminManage showMessage={showMessage} />;
      default:
        return <AdminEvents showMessage={showMessage} />;
    }
  };

  return (
    // We re-use the main dashboard CSS classes for a consistent look
    <div className="dashboard-container">
      {/* Admin-specific Header */}
      <header className="dashboard-header">
        <h1>Admin Panel</h1>
        <div>
          <span>Welcome, {user?.name} (Admin)</span>
          <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main content area */}
      <main className="dashboard-main">
        {/* Admin-specific Sidebar */}
        <nav className="sidebar">
          <ul>
            <li 
              className={activeTab === TABS.EVENTS ? 'active' : ''} 
              onClick={() => setActiveTab(TABS.EVENTS)}
            ></li>
            <li 
              className={activeTab === TABS.EVENTS ? 'active' : ''} 
              onClick={() => setActiveTab(TABS.EVENTS)}
            >
              📝 Create Event
            </li>
            <li 
              className={activeTab === TABS.FAQS ? 'active' : ''} 
              onClick={() => setActiveTab(TABS.FAQS)}
            >
              🧠 Add FAQs
            </li>
            <li 
              className={activeTab === TABS.REGISTRATIONS ? 'active' : ''} 
              onClick={() => setActiveTab(TABS.REGISTRATIONS)}
            >
              👥 Event Registrations
            </li>
          </ul>
        </nav>
        
        {/* The content on the right, with padding */}
        <section className="content content-padded">
          {/* Notification Message Bar */}
          {message && (
            <div style={{
              padding: '1rem',
              background: message.error ? '#dc3545' : '#28a745',
              color: 'white',
              borderRadius: '8px',
              marginBottom: '2rem',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {message.text}
            </div>
          )}
          
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;