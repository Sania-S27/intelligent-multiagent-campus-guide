import React, { useState, useEffect } from 'react'; // <-- useEffect is needed
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
// VVV 1. IMPORT THE NOTIFICATION API VVV
import { getUserNotifications, markNotificationsRead,clearUserNotifications } from '../api'; 
import Navigation from '../components/Navigation';
import Events from '../components/Events';
import FAQ from '../components/FAQ';
import SupportChat from '../components/SupportChat';
import NotificationList from '../components/NotificationList'; 

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('navigation');
  // VVV 2. GET THE WELCOME MESSAGE FROM AUTHCONTEXT VVV
  const { user, logout, isGuest, isAdmin, appMessage, clearAppMessage } = useAuth();
  const navigate = useNavigate();

  // VVV 3. STATE FOR *EVENT* NOTIFICATIONS VVV
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // VVV 4. USEEFFECT FOR *WELCOME* BANNER (fades after 5s) VVV
  useEffect(() => {
    if (appMessage) {
      const timer = setTimeout(() => {
        clearAppMessage(); 
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [appMessage, clearAppMessage]);

  // VVV 5. USEEFFECT FOR *EVENT* NOTIFICATIONS (fetches on load) VVV
  const fetchNotifications = async () => {
    try {
      const res = await getUserNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    if (isGuest) return; // Guests don't have notifications
    fetchNotifications();
  }, [isGuest]); 

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // VVV 6. HANDLER TO MARK EVENT NOTIFICATIONS AS READ VVV
  const clearUnreadNotifications = async () => {
    if (unreadCount > 0) {
      try {
        await markNotificationsRead();
        setUnreadCount(0); // Clear the banner
        // Update the visual state of the list
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    }
  };

  // 7. Update tab click handlers
  const handleProtectedTabClick = (tabName, tabTitle) => {
    if (isGuest) {
      // Guest logic (unchanged)
      const shouldLogin = window.confirm(
        `You must be logged in to view ${tabTitle}. Do you want to go to the Login page now?`
      );
      if (shouldLogin) {
        navigate('/login', { state: { message: `Please log in to view ${tabTitle}.` } });
      }
    } else {
      // Logged-in user logic
      setActiveTab(tabName);
      // If user clicks "Events", clear the event notification
      if (tabName === 'events') {
        clearUnreadNotifications();
      }
    }
  };
  const handleClearHistory = async () => {
     if (window.confirm("Are you sure you want to delete all your notifications? This action cannot be undone.")) {
        try {
          await clearUserNotifications();
          fetchNotifications(); // Re-fetch to get the new empty list
        } catch (err) {
          console.error("Failed to clear history", err);
          alert("Could not clear notification history.");
        }
     }
  };
  
  const handleNotificationClick = () => {
    setActiveTab('notifications');
    // If user clicks "Notifications", clear the event notification
    clearUnreadNotifications();
  };

  // VVV 8. INTER-AGENT COMMUNICATION HANDLER (Events -> Nav) VVV
  // (We need to pass 'destinationToNavigate' state down)
  const [destinationToNavigate, setDestinationToNavigate] = useState(null);
  const handleNavigateToEvent = (locationName) => {
    setDestinationToNavigate(locationName);
    setActiveTab('navigation');
  };
  // ^^^ END OF HANDLER ^^^

  const renderContent = () => {
    switch (activeTab) {
      case 'navigation':
        return (
          <Navigation 
            destinationToNavigate={destinationToNavigate}
            clearDestinationToNavigate={() => setDestinationToNavigate(null)}
          />
        );
      case 'events':
        return (
          <div className="content-padded">
            <Events onNavigateRequest={handleNavigateToEvent} />
          </div>
        );
      case 'faq':
        return <div className="content-padded"><FAQ /></div>;
      case 'support':
        return (
          <div className="content-padded">
            <SupportChat 
              onNavigateRequest={handleNavigateToEvent} // Reuse the existing handler
              onViewEventsRequest={() => setActiveTab('events')} // New handler for events
            />
          </div>
        );
      case 'notifications':
        // VVV 3. PASS THE NEW HANDLER DOWN AS A PROP VVV
        return <div className="content-padded"><NotificationList notifications={notifications} onClearHistory={handleClearHistory} /></div>;
      default:
        return <Navigation />;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>BIET Campus Guide</h1>
        <div>
          <span>Welcome, {user?.name} {user?.role !== 'guest' ? `(${user?.role})` : ''}</span>
          {isGuest ? (
            <button onClick={() => navigate('/login')} style={{ marginLeft: '1rem', background: '#28a745' }}>
              Login
            </button>
          ) : (
            <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
              Logout
            </button>
          )}
        </div>
      </header>
      
      {/* VVV 9. RENDER THE TWO BANNERS SEPARATELY VVV */}

      {/* BANNER 1: The "Welcome" message (fades after 5s) */}
      {appMessage && (
        <div style={{
          padding: '10px 20px',
          background: appMessage.type === 'success' ? '#d4edda' : '#fff3cd',
          color: appMessage.type === 'success' ? '#155724' : '#856404',
          textAlign: 'center',
          borderBottom: '1px solid #c3e6cb',
          fontWeight: '500',
        }}>
          {appMessage.text}
        </div>
      )}
      
      {/* BANNER 2: The "New Event" message (persistent) */}
      {unreadCount > 0 && (
        <div 
          style={{
            padding: '10px 20px',
            background: '#fff3cd', // Yellow "warning" color
            color: '#856404',
            textAlign: 'center',
            borderBottom: '1px solid #ffeeba',
            fontWeight: '500',
            cursor: 'pointer',
          }} 
          onClick={handleNotificationClick} // Click banner to go to list
        >
          You have {unreadCount} new notification(s)! Click here to view.
        </div>
      )}
      {/* ^^^ END OF BANNERS ^^^ */}
      
      <main className="dashboard-main">
        <nav className="sidebar">
          <ul>
            <li 
              className={activeTab === 'navigation' ? 'active' : ''} 
              onClick={() => setActiveTab('navigation')}
            >
              🧭 Navigation
            </li>
            <li 
              className={activeTab === 'events' ? 'active' : ''} 
              onClick={() => handleProtectedTabClick('events', 'Events')}
            >
              🎉 Events
            </li>
            <li 
              className={activeTab === 'faq' ? 'active' : ''} 
              onClick={() => setActiveTab('faq')}
            >
              ❓ FAQs
            </li>
            <li 
              className={activeTab === 'support' ? 'active' : ''} 
              onClick={() => setActiveTab('support')}
            >
              💬 Support
            </li>
            
            {!isGuest && (
              <li 
                className={activeTab === 'notifications' ? 'active' : ''} 
                onClick={handleNotificationClick} // <-- Use the new handler
              >
                {/* Show a badge if there are unread messages */}
                🔔 Notifications {unreadCount > 0 && <strong style={{color: '#ffc107', marginLeft: '5px'}}>({unreadCount})</strong>}
              </li>
            )}

            {isAdmin && (
              <li onClick={() => navigate('/admin/dashboard')}>
                ⚙️ Admin Panel
              </li>
            )}
          </ul>
        </nav>
        <section className="content">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;