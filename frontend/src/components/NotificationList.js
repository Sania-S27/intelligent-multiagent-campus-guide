import React from 'react';
// VVV 1. REMOVE useState, useEffect, and getUserNotifications VVV

// VVV 2. ACCEPT 'notifications' AND 'onClearHistory' AS PROPS VVV
const NotificationList = ({ notifications, onClearHistory }) => {
    
    // VVV 3. REMOVE THE useEffect AND fetchNotifications VVV
    // useEffect(() => { ... }, []);

    const formatTime = (time) => new Date(time).toLocaleString();

    // VVV 4. REMOVE THE 'loading' STATE VVV
    // if (loading) { ... }

    return (
        <div>
            {/* VVV 5. ADD A HEADER WITH THE BUTTON VVV */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px' }}>
                <h2 style={{ color: 'var(--gradient-end)', margin: 0, border: 'none' }}>
                    Notification History
                </h2>
                {/* Add the Clear button only if there are notifications */}
                {notifications.length > 0 && (
                    <button 
                        className="nav-button stop-travel" // Use the red "stop" style
                        style={{ width: 'auto', height: 'fit-content' }}
                        onClick={onClearHistory} // Call the function from the Dashboard
                    >
                        Clear History
                    </button>
                )}
            </div>
            
            <div className="item-list" style={{ maxWidth: 'unset', marginTop: '1.5rem' }}>
                {notifications.length === 0 ? (
                    <p>No past notifications found.</p>
                ) : (
                    notifications.map(n => (
                        // This styling is correct and will now update instantly
                        <div key={n.id} className="item-card" style={{ opacity: n.is_read ? 0.7 : 1 }}>
                            <p style={{ fontWeight: 'bold' }}>{n.subject}</p>
                            <small>Sent: {formatTime(n.sent_at)}</small>
                            <span style={{ float: 'right', color: n.is_read ? '#6c757d' : '#dc3545' }}>
                                {n.is_read ? 'Read' : 'New'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationList;