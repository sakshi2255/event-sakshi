import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react'; 
import { useAuth } from '../../../model/auth/auth.context';
import '../../../view/styles/GlobalHub.css';
import '../../../view/styles/Dashboard.css';
import '../../../view/styles/Management.css';

const ViewEvents = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('explorer'); 
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- NEW: ADVANCED TICKET TOKEN STATE ---
  const [ticketToken, setTicketToken] = useState("");

  const fetchData = async () => {
    try {
      const [allRes, myRes, savedRes] = await Promise.all([
        api.get('/events/approved'),
        api.get('/events/my-registrations'),
        api.get('/events/my-saved')
      ]);
      setEvents(allRes.data);
      setMyRegistrations(myRes.data.map(e => e.id));
      setSavedIds(savedRes.data.map(e => e.id));
    } catch (err) {
      toast.error("Failed to sync event data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- NEW: TICKET ROTATION LOGIC (Refreshes every 30s) ---
  useEffect(() => {
    let interval;
    if (activeTab === 'ticket' && selectedEvent) {
      const generateToken = () => {
        // We use a time-step (epoch / 30000ms) to ensure the code changes every 30 seconds
        const timeStep = Math.floor(Date.now() / 30000);
        // We use the ticket_token from DB (UUID) + TimeStep for high security
        const securePayload = `${selectedEvent.ticket_token}-${timeStep}`;
        setTicketToken(securePayload);
      };

      generateToken(); // Generate immediately
      interval = setInterval(generateToken, 30000); // Rotate every 30s
    }
    return () => clearInterval(interval);
  }, [activeTab, selectedEvent]);

  // ... (keep handleToggleSave and handleRegister as they are)

  const handleToggleSave = async (e, eventId) => {
    e.stopPropagation();
    try {
      const res = await api.post('/events/toggle-save', { eventId });
      toast.success(res.data.message);
      fetchData(); 
    } catch (err) {
      toast.error("Action failed");
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post('/events/register', { eventId });
      toast.success("Registration successful!");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  const openDetails = (event) => {
    setSelectedEvent(event);
    setActiveTab('details');
  };

  const openTicket = (event) => {
    setSelectedEvent(event);
    setActiveTab('ticket');
  };

  const getFilteredEvents = () => {
    let baseEvents = events;
    if (activeTab === 'bookings') baseEvents = events.filter(e => myRegistrations.includes(e.id));
    if (activeTab === 'wishlist') baseEvents = events.filter(e => savedIds.includes(e.id));
    return baseEvents.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
  };

  if (loading) return <div className="org-hub-container">Loading Events Hub...</div>;

  return (
    <div className="org-hub-container">
      {/* 1. Ribbon Tabs */}
      <div className="management-ribbon">
        {[
          { id: 'explorer', label: '🌐 Event Explorer' },
          { id: 'bookings', label: '✅ My Bookings' },
          { id: 'wishlist', label: '❤️ Wishlist' }
        ].map(tab => (
          <div 
            key={tab.id}
            className={`nav-card ${activeTab === tab.id || activeTab === 'details' || activeTab === 'ticket' ? (activeTab === tab.id ? 'active-state' : '') : ''}`} 
            onClick={() => {
                setActiveTab(tab.id);
                setSelectedEvent(null);
            }}
          >
            <span className="card-label">{tab.label}</span>
          </div>
        ))}
      </div>

      <div className="hub-workspace">
        
        {/* VIEW A: LISTING GRID */}
        {(activeTab === 'explorer' || activeTab === 'bookings' || activeTab === 'wishlist') && (
          <div className="db-container">
            <div className="search-filter-container">
              <input 
                type="text" 
                placeholder="Search by title..." 
                className="mgmt-input"
                style={{ marginBottom: 0 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="event-grid">
              {getFilteredEvents().map(event => (
                <div key={event.id} className="event-card">
                   <button 
                    onClick={(e) => handleToggleSave(e, event.id)} 
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
                  >
                    {savedIds.includes(event.id) ? <span>❤️</span> : <span style={{color:'#94a3b8'}}>♡</span>}
                  </button>

                  <div className="event-badge">{event.organization_name}</div>
                  <h3 className="event-title">{event.title}</h3>
                  <p style={{color:'#64748b', fontSize:'13px'}}>📅 {new Date(event.event_date).toLocaleDateString()}</p>
                  
                  <div className="grid-action-wrapper">
                    <button className="update-pill-btn pill-btn-blue pill-btn-compact" onClick={() => openDetails(event)}>
                       🔍 Details
                    </button>

                    {myRegistrations.includes(event.id) ? (
                      <button className="update-pill-btn pill-btn-success pill-btn-compact" onClick={() => openTicket(event)}>
                        🎫 Pass
                      </button>
                    ) : (
                      <button className="update-pill-btn pill-btn-compact" onClick={() => handleRegister(event.id)}>
                        Register
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW B: DETAIL VIEW */}
        {activeTab === 'details' && selectedEvent && (
          <div className="db-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px' }}>
              <button 
                className="mgmt-cancel-btn" 
                style={{ width: '40px', height: '40px', padding: 0, borderRadius: '50%' }}
                onClick={() => setActiveTab('explorer')}
              > ← </button>
              <h2 className="db-title" style={{ margin: 0 }}>{selectedEvent.title}</h2>
            </div>

            <div className="mgmt-card" style={{ marginBottom: '25px', display: 'flex', flexWrap: 'wrap', gap: '90px', backgroundColor: '#f8fafc' }}>
              <div>
                <p className="stat-label">📍 Location</p>
                <p className="cell-main">{selectedEvent.location}</p>
              </div>
              <div>
                <p className="stat-label">📅 Date</p>
                <p className="cell-main">{new Date(selectedEvent.event_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="stat-label">🏢 Organizer</p>
                <div className="status-badge status-blue">{selectedEvent.organization_name}</div>
              </div>
            </div>

            <div className="mgmt-card" style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#47B599', marginBottom: '15px' }}>Event Description</h4>
              <p style={{ lineHeight: '1.8', color: '#334155', whiteSpace: 'pre-wrap' }}>{selectedEvent.description}</p>
            </div>

            <div className="mgmt-card" style={{ marginBottom: '25px', borderLeft: '4px solid #f97316' }}>
              <h4 style={{ color: '#f97316', marginBottom: '10px' }}>Terms & Conditions</h4>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                {selectedEvent.terms_conditions || "Standard platform terms apply."}
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
                {myRegistrations.includes(selectedEvent.id) ? (
                    <button className="update-pill-btn pill-btn-success" onClick={() => openTicket(selectedEvent)}>🎫 View Your Ticket</button>
                ) : (
                    <button className="update-pill-btn" onClick={() => handleRegister(selectedEvent.id)}>Register Now</button>
                )}
            </div>
          </div>
        )}

        {/* VIEW C: ADVANCED TICKET VIEW */}
        {activeTab === 'ticket' && selectedEvent && (
          <div className="db-container" style={{maxWidth:'450px', margin:'0 auto'}}>
            <button className="mgmt-cancel-btn" onClick={() => setActiveTab('bookings')} style={{marginBottom:'20px'}}> ← Back </button>
            
            {/* This div is what will be downloaded */}
            <div id="printable-ticket" className="mgmt-card" style={{textAlign:'center', border:'1px solid #e2e8f0', padding: '30px'}}>
              <h1 style={{ color: '#47B599', margin: '0 0 10px 0' }}>SOEMS</h1>
              <h3 className="db-title" style={{marginBottom: '5px'}}>{selectedEvent.title}</h3>
              <p className="stat-label" style={{marginBottom: '20px'}}>{selectedEvent.organization_name}</p>
              
              <div style={{ margin: '15px auto', padding: '15px', background: '#fff', display: 'inline-block', borderRadius: '12px', border: '2px solid #f1f5f9' }}>
                <QRCodeSVG 
                  value={ticketToken} 
                  size={200}
                  level="H"
                />
              </div>

              <div className="stats-grid" style={{gridTemplateColumns:'1fr 1fr', gap:'10px', marginTop: '20px'}}>
                <div className="stat-card" style={{padding:'10px', background: '#f8fafc'}}>
                  <p className="stat-label">Attendee</p>
                  <p style={{fontSize:'14px', fontWeight:'bold'}}>{user?.full_name}</p>
                </div>
                <div className="stat-card" style={{padding:'10px', background: '#f8fafc'}}>
                  <p className="stat-label">Venue</p>
                  <p style={{fontSize:'14px', fontWeight:'bold'}}>{selectedEvent.location}</p>
                </div>
              </div>
              <p style={{fontSize:'10px', color:'#94a3b8', marginTop:'20px'}}>
                This is a secure digital entry pass. Do not share.
              </p>
            </div>

            <button 
                className="update-pill-btn" 
                style={{ width: '100%', marginTop: '15px', padding: '12px' }}
                onClick={handleDownloadTicket}
            >
                📥 Download HD Ticket Pass
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewEvents;