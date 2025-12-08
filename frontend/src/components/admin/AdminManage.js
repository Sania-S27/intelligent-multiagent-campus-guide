import React from 'react';
import { adminClearAllNotifications } from '../../api';

const AdminManage = ({ showMessage }) => {

  const handleClearHistory = async () => {
    if (window.confirm("DANGER: Are you sure you want to delete all notification history for *all users*? This action cannot be undone.")) {
      try {
        await adminClearAllNotifications();
        showMessage("Successfully cleared all user notification history.");
      } catch (err) {
        showMessage("Failed to clear history.", true);
      }
    }
  };

  return (
    <div className="admin-form" style={{borderColor: '#dc3545'}}>
      <h3>Site Management (Danger Zone)</h3>
      
      <div className="item-card" style={{border: '1px solid #f5c6cb'}}>
        <p><strong>Clear All Notification History</strong></p>
        <p style={{color: '#555', fontSize: '0.9rem'}}>
          This will permanently delete the notification history for every user in the system.
        </p>
        <button 
          type="button"
          className="nav-button stop-travel" // Red button
          style={{ width: 'auto' }}
          onClick={handleClearHistory}
        >
          Clear All History
        </button>
      </div>
    </div>
  );
};

export default AdminManage;