import React, { useState, useEffect } from 'react';
import { getEventRegistrations } from '../../api';

const AdminRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const res = await getEventRegistrations();
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to load registrations", err);
      } finally {
        setLoading(false);
      }
    };
    loadRegistrations();
  }, []);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  if (loading) {
    return <p>Loading event registrations...</p>;
  }

  return (
    <div>
      <h2 style={{ color: 'var(--gradient-end)', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px' }}>
        Event Registrations
      </h2>
      <p>Showing all events with one or more registrations, sorted by date.</p>

      <div className="item-list">
        {events.length === 0 && <p>No users have registered for any events yet.</p>}

        {events.map(event => (
          <div key={event.id} className="item-card">
            <h3>{event.title}</h3>
            <p><strong>Event Date:</strong> {formatDate(new Date(event.event_date).setDate(new Date(event.event_date).getDate() + 1))}</p>
            <p><strong>Total Registered:</strong> {event.registrations.length}</p>
            
            <h4 style={{marginTop: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>Registered Users:</h4>
            
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{textAlign: 'left', borderBottom: '1px solid #ccc'}}>
                  <th style={{padding: '8px'}}>Name</th>
                  <th style={{padding: '8px'}}>Email</th>
                </tr>
              </thead>
              <tbody>
                {event.registrations.map(reg => (
                  <tr key={reg.user.email} style={{borderBottom: '1px solid #f0f0f0'}}>
                    <td style={{padding: '8px'}}>{reg.user.name}</td>
                    <td style={{padding: '8px'}}>{reg.user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRegistrations;