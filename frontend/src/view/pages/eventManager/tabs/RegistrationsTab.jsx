import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import toast from 'react-hot-toast';

const RegistrationsTab = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEventsAndCounts = async () => {
      try {
        // 1. Fetch all managed events
        const res = await api.get('/events/managed-events');
        const eventData = res.data.success ? res.data.data : res.data;
        const eventList = Array.isArray(eventData) ? eventData : [];

        // 2. Automatically fetch the exact registration count for EACH event 
        // so the cards show the correct number right away.
        const eventsWithCounts = await Promise.all(
          eventList.map(async (ev) => {
            try {
              const regRes = await api.get(`/events/${ev.id}/registrations`);
              const regs = regRes.data.success ? regRes.data.data : (Array.isArray(regRes.data) ? regRes.data : []);
              
              // Attach the real count to the event object
              return { ...ev, live_count: regs.length };
            } catch (err) {
              return { ...ev, live_count: 0 };
            }
          })
        );

        setEvents(eventsWithCounts);
      } catch (error) {
        toast.error("Failed to load events");
      }
    };

    fetchEventsAndCounts();
  }, []);

  const handleCardClick = async (event) => {
    setSelectedEvent(event);
    setLoadingRegs(true);
    
    try {
      const res = await api.get(`/events/${event.id}/registrations`);
      setRegistrations(res.data.success ? res.data.data : res.data);
    } catch (err) {
      toast.error("Failed to load registration list");
    } finally {
      setLoadingRegs(false);
    }
  };

  const handleBackClick = () => {
    setSelectedEvent(null);
    setRegistrations([]);
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
    event.deleted_at === null
  );

  return (
    <div className="db-container">
      
      {!selectedEvent ? (
        /* =========================================
           VIEW 1: EVENT CARDS GRID 
           ========================================= */
        <>

          <div className="search-wrapper">
            <input 
              type="text" 
              placeholder="Search events..." 
              className="mgmt-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="event-grid">
            {filteredEvents.map(event => (
              <div key={event.id} className="event-card">
                
                <div className={`status-badge status-${event.status?.toLowerCase() || 'approved'}`}>
                  {event.status || 'APPROVED'}
                </div>
                
                <h3 className="event-title">{event.title}</h3>
                <p className="helper-text">📅 {new Date(event.event_date).toLocaleDateString()}</p>
                <p className="helper-text">📍 {event.location || 'Venue TBD'}</p>
                
                {/* 🔥 This will now show the LIVE exact count for every card! 🔥 */}
                <p className="helper-text" style={{ marginTop: '10px', fontWeight: 'bold' }}>
                  👥 Total Registered: {event.live_count || 0}
                </p>

                <div className="event-card-actions">
                  <button 
                    className={`event-card-btn ${selectedEvent?.id === event.id ? 'active' : ''}`}
                    onClick={() => handleCardClick(event)}
                  >
                    View Registrations
                  </button>
                </div>

              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <p className="helper-text">No events found.</p>
            )}
          </div>
        </>
      ) : (
        /* =========================================
           VIEW 2: REGISTRATION LIST TABLE 
           ========================================= */
        <>
          <div className="form-actions">
            <button className="back-btn" onClick={handleBackClick}>
              &larr; Back to Events
            </button>
          </div>

          <br />

          <div className="manage-staff-table-card">
            
            <div className="table-header-flex">
              <h3 className="table-header-title">
                Registrations for "{selectedEvent.title}"
              </h3>
              <span className="staff-chip">
                Total: {registrations.length}
              </span>
            </div>

            {loadingRegs ? (
              <p className="helper-text" style={{ padding: '2rem', textAlign: 'center' }}>Loading attendees...</p>
            ) : (
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Date Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg, idx) => (
                    <tr key={idx}>
                      <td><strong>{reg.full_name}</strong></td>
                      <td>{reg.email}</td>
                      <td>{new Date(reg.registered_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                  
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan="3" className="helper-text" style={{ textAlign: 'center', padding: '2rem' }}>
                        No users have registered for this event yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default RegistrationsTab;