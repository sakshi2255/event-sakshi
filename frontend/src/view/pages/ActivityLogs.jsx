import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import '../styles/Management.css';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      // Hits the backend endpoint at /api/admin/logs
      const res = await api.get('/admin/logs', {
        params: { search: searchTerm, action: filterAction }
      });
      setLogs(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load activity logs");
      setLoading(false);
    }
  }, [searchTerm, filterAction]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchLogs]);

  return (
    <div className="mgmt-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#04befe', margin: 0 }}>System Activity Audit Trail</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            className="mgmt-input" 
            style={{ width: '250px', marginBottom: 0 }}
            placeholder="Search details or admin name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <select 
            className="mgmt-input" 
            style={{ width: '220px', marginBottom: 0 }}
            value={filterAction} 
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="">All Actions</option>
            {/* User & Role Actions */}
            <option value="UPDATE_USER_ROLE">User Role Updates</option>
            <option value="DELETE_USER">User Deletions</option>
            
            {/* Event Lifecycle Actions */}
            <option value="CREATE_EVENT">Event Creations</option>
            <option value="MODERATE_EVENT">Event Moderation</option>
            <option value="UPDATE_EVENT">Event Updates</option>
            <option value="ASSIGN_EVENT_MANAGER">Manager Assignments</option>
            <option value="EVENT_LIFECYCLE">Lifecycle Changes</option>

            {/* Organization Actions */}
            <option value="REGISTER_ORG">Institution Registration</option>
            
            {/* System Actions */}
            <option value="CREATE_CATEGORY">Category Additions</option>
            <option value="UPDATE_SETTING">Setting Changes</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="mgmt-table">
          <thead>
            <tr>
              <th className="mgmt-th">Timestamp</th>
              <th className="mgmt-th">Admin</th>
              <th className="mgmt-th">Action Type</th>
              <th className="mgmt-th">Target ID</th>
              <th className="mgmt-th">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? logs.map(log => (
              <tr key={log.id}>
                <td className="mgmt-td" style={{ fontSize: '12px' }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="mgmt-td" style={{ fontWeight: 'bold' }}>
                  {log.admin_name || `ID: ${log.admin_id}`}
                </td>
                <td className="mgmt-td">
                  <span className={`status-badge status-${log.action_type.toLowerCase().includes('delete') ? 'rejected' : 'approved'}`} style={{ fontSize: '10px' }}>
                    {log.action_type}
                  </span>
                </td>
                <td className="mgmt-td">#{log.target_id || 'N/A'}</td>
                <td className="mgmt-td" style={{ color: '#64748b', fontSize: '13px' }}>{log.details}</td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No logs found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityLogs;