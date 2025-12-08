import React, { useState, useEffect, useCallback } from 'react'; // <-- Import useCallback
import { getEvents , registerForEvent} from '../api'; // Make sure this is in your api/index.js
import { useAuth } from '../context/AuthContext';

// VVV REMOVED 'BRANCHES' VVV
const CATEGORIES = ["Technical", "Cultural", "Sports", "Workshop", "General"];

const Events = ({ onNavigateRequest }) => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { isGuest } = useAuth();
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSortBy, setFilterSortBy] = useState('date'); // 'date' or 'recent' 
  // VVV REMOVED 'filterBranch' STATE VVV

  // VVV UPDATED fetchEvents VVV
  const fetchEvents = useCallback(async () => {
    try {
      // Pass filters to the API call
      const response = await getEvents(searchTerm, filterCategory, filterSortBy);
      setEvents(response.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  }, [searchTerm, filterCategory, filterSortBy]); // <-- Re-run on filter change
  // Fetch events when the component loads or search term changes
  useEffect(() => {
    // Set a small delay (debounce) on search to avoid spamming the API
    const timerId = setTimeout(() => {
      fetchEvents();
    }, 500); // 500ms delay
    
    return () => clearTimeout(timerId);
  }, [fetchEvents]); // <-- VVV UPDATED DEPENDENCY VVV

  // Helper to format the date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const handleRegisterClick = async (event) => {
    // Check for external link first
    if (event.registration_link) {
        window.open(event.registration_link, '_blank');
        return;
    } 

    // Internal registration logic
    if (isGuest) {
        alert("You must log in to register for events.");
        return;
    }

    try {
        await registerForEvent(event.id);
        alert("Successfully registered for the event!");
        // Refresh events list to update the button status
        fetchEvents(); 
    } catch (error) {
        alert(error.response?.data?.detail || "Registration failed. You may be already registered.");
    }
  };

  return (
    <div>
      {/* This title is styled by index.css now */}
      <h2 style={{ color: 'var(--gradient-end)', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px' }}>
        Upcoming Events
      </h2>
      
      <div className="filter-bar" style={{display: 'flex', gap: '1rem', margin: '1rem 0', flexWrap: 'wrap'}}>
        <input
          type="text"
          placeholder="Search events..."
          className="search-bar"
          style={{width: '300px', margin: 0}}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="nav-select" 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        
        {/* VVV ADD SORT BY DROPDOWN VVV */}
        <select 
          className="nav-select" 
          value={filterSortBy} 
          onChange={(e) => setFilterSortBy(e.target.value)}
        >
          <option value="date">Sort by Event Date</option>
          <option value="recent">Sort by Recently Added</option>
        </select>
      </div>
      {/* ^^^ END FILTER BAR ^^^ */}
      <div className="item-list">
        {events.length > 0 ? (
          events.map(event => (
            <div key={event.id} className="item-card">
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3>{event.title}</h3>
                {/* Show tags for category/branch */}
                <div style={{display: 'flex', gap: '5px', height: 'fit-content'}}>
                  {event.category && <span style={{background: '#e6f7ff', border: '1px solid #b3e0ff', padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem'}}>{event.category}</span>}
                  
                  {/* VVV 'Branch' TAG REMOVED VVV */}
                  
                </div>
              </div>

              {event.location_name && (
                <p style={{ color: '#0056b3', fontWeight: 'bold', margin: '0.5rem 0' }}>
                  📍 Venue: {event.location_name}
                </p>
              )}
              <p style={{ color: '#555', fontWeight: '500' }}>
                {/* Fixed date formatting to prevent timezone bug */}
                📅 Date: {formatDate(new Date(event.event_date).setDate(new Date(event.event_date).getDate() + 1))}
              </p>
              <p>{event.description}</p>
              
              <div className="event-buttons"> 
                {event.is_registered ? (
                    <button className="nav-button" style={{ background: '#28a745', opacity: 0.7 }} disabled>
                        ✓ Registered
                    </button>
                ) : (
                    <button 
                        className="nav-button" 
                        style={{ background: 'var(--primary-color)', width: 'auto' }}
                        onClick={() => handleRegisterClick(event)}
                    >
                        {event.registration_link ? 'Register (External)' : 'Register Now'}
                    </button>
                )}
                
                {event.location_name && (
                  <button 
                    className="nav-button get-directions" 
                    style={{ width: 'auto' }}
                    onClick={() => onNavigateRequest(event.location_name)}
                  >
                    Get Directions
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No upcoming events found matching your filters.</p>
        )}
      </div>
    </div>
  );
};

export default Events;