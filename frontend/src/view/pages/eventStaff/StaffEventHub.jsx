import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import StaffMyEventsTab from "./tabs/StaffMyEventsTab";
import EventExplorerTab from '../org-admin/tabs/EventExplorerTab'; 
import StaffRegistrationsTab from './tabs/StaffRegistrationsTab';
import StaffViewTeamTab from './tabs/StaffViewTeamTab';
import { useAuth } from '../../../model/auth/auth.context'
// Reuse existing styles
import "../../styles/GlobalHub.css"; 
import "../../styles/Form.css";
import "../../styles/Dashboard.css";

const StaffEventHub = () => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'assigned') fetchAssignedEvents();
  }, [activeTab]);
  
  const fetchAssignedEvents = async () => {
    setLoading(true);
    try {
      // Logic: Hit the staff-specific route
      const res = await api.get('/events/assigned-events'); 
      const eventData = res.data.success ? res.data.data : res.data;
      setEvents(Array.isArray(eventData) ? eventData : []);
    } catch (err) {
      toast.error("Could not load your assigned events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const navCards = [
    { id: 'assigned', label: 'My Assignments' },
    { id: 'explorer', label: 'Event Explorer' },
    { id: 'registrations', label: 'View Registrations' },
    { id: 'view-team', label: 'View Team' }
  ];

  return (
    <div className="org-hub-container">
      <div className="management-ribbon">
        {navCards.map((card) => (
          <div 
            key={card.id}
            className={`nav-card ${activeTab === card.id ? 'active-state' : ''}`}
            onClick={() => setActiveTab(card.id)}
          >
            <span className="card-label">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="hub-workspace">
        {activeTab === 'assigned' && <StaffMyEventsTab events={events} loading={loading} />}
        {activeTab === 'explorer' && <EventExplorerTab />}
        {activeTab === 'registrations' && <StaffRegistrationsTab />}
        {activeTab === 'view-team' && <StaffViewTeamTab />} 
      </div>
    </div>
  );
};

export default StaffEventHub;