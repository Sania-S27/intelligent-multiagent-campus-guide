import React, { useState, useEffect } from 'react';
import { createEvent, getLocations } from '../../api';
const CATEGORIES = ["Technical", "Cultural", "Sports", "Workshop", "General"];
// This component receives the showMessage function as a prop
const AdminEvents = ({ showMessage }) => {
  // State for the Event form
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocationId, setEventLocationId] = useState('');
  const [eventRegistrationLink, setEventRegistrationLink] = useState('');
  const [allLocations, setAllLocations] = useState([]);
  const [eventCategory, setEventCategory] = useState('');
  
  // Load locations on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await getLocations();
        setAllLocations(res.data);
      } catch (err) {
        console.error("Failed to load locations", err);
      }
    };
    loadLocations();
  }, []);

  // Handle Event form submission
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEvent({ 
        title: eventTitle, 
        description: eventDesc, 
        event_date: eventDate,
        location_id: eventLocationId ? parseInt(eventLocationId) : null,
        registration_link: eventRegistrationLink || null,
        category: eventCategory || null
      });
      showMessage('Event created successfully!');
      // Clear the form
      setEventTitle('');
      setEventDesc('');
      setEventDate('');
      setEventLocationId('');
      setEventRegistrationLink('');
      setEventCategory('');
    } catch (err) {
      showMessage('Failed to create event.', true);
    }
  };

  return (
    <form onSubmit={handleEventSubmit} className="admin-form">
      <h3>Create New Event</h3>
      
      <label>Event Title</label>
      <input 
        type="text" 
        placeholder="e.g., Tech Fest 2025" 
        value={eventTitle} 
        onChange={(e) => setEventTitle(e.target.value)} 
        required 
      />
      
      <label>Event Date</label>
      <input 
        type="date" 
        value={eventDate} 
        onChange={(e) => setEventDate(e.target.value)} 
        required 
      />
      
      <label>Venue (Optional)</label>
      <select 
        value={eventLocationId} 
        onChange={(e) => setEventLocationId(e.target.value)}
        className="nav-select"
        style={{width: '100%', marginBottom: '1rem', padding: '10px'}}
      >
        <option value="">Select a campus location...</option>
        {allLocations.map(loc => (
          <option key={loc.id} value={loc.id}>
            {loc.name}
          </option>
        ))}
        <option value="">(No specific venue / Online)</option>
      </select>

      <label>Registration Link (Optional)</label>
      <input 
        type="url" 
        placeholder="e.g., https://register.biet.com/event" 
        value={eventRegistrationLink} 
        onChange={(e) => setEventRegistrationLink(e.target.value)} 
      />
      <label>Category (Optional)</label>
      <select
        value={eventCategory}
        onChange={(e) => setEventCategory(e.target.value)}
        className="nav-select"
        style={{width: '100%', marginBottom: '1rem', padding: '10px'}}
      >
        <option value="">Select a category...</option>
        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      
      <label>Event Description</label>
      <textarea 
        placeholder="A short description of the event..." 
        value={eventDesc} 
        onChange={(e) => setEventDesc(e.target.value)} 
        rows={4}
      />
      
      <button type="submit" className="nav-button" style={{ background: '#28a745' }}>Add Event</button>
    </form>
  );
};

export default AdminEvents;