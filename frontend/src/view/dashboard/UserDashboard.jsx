import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../view/styles/Dashboard.css';

const UserDashboard = () => {
  const [stats, setStats] = useState({ registered: 0, saved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [regRes, savedRes] = await Promise.all([
          api.get('/events/my-registrations'),
          api.get('/events/my-saved')
        ]);
        setStats({
          registered: regRes.data.length,
          saved: savedRes.data.length
        });
      } catch (err) {
        console.error("Stats fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="db-container">Loading Dashboard...</div>;

  return (
    <div className="db-container">
      <h2 className="db-title">Welcome Back!</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">My Registrations</p>
          <div className="stat-value">{stats.registered}</div>
        </div>
        <div className="stat-card">
          <p className="stat-label">Saved Events</p>
          <div className="stat-value">{stats.saved}</div>
        </div>
      </div>
      {/* You can add a 'Quick Explore' button here that navigates to /user/events */}
    </div>
  );
};

export default UserDashboard;