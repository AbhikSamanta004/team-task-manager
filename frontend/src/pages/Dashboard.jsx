import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiCheckCircle, FiClock, FiList, FiAlertTriangle } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0, overdue: 0, tasksPerUser: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div>
      <h2 className="mb-6">Dashboard Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="flex items-center justify-between">
            <div className="stat-label">Total Tasks</div>
            <FiList size={24} color="var(--primary-color)" />
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>

        <div className="stat-card todo">
          <div className="flex items-center justify-between">
            <div className="stat-label">To Do</div>
            <FiClock size={24} color="var(--text-secondary)" />
          </div>
          <div className="stat-value">{stats.todo}</div>
        </div>

        <div className="stat-card progress">
          <div className="flex items-center justify-between">
            <div className="stat-label">In Progress</div>
            <FiClock size={24} color="var(--warning-color)" />
          </div>
          <div className="stat-value">{stats.inProgress}</div>
        </div>

        <div className="stat-card done">
          <div className="flex items-center justify-between">
            <div className="stat-label">Done</div>
            <FiCheckCircle size={24} color="var(--success-color)" />
          </div>
          <div className="stat-value">{stats.done}</div>
        </div>
      </div>

      {stats.overdue > 0 && (
        <div className="glass p-6 flex items-center gap-4 mt-8 mb-8" style={{ borderLeft: '4px solid var(--danger-color)' }}>
          <FiAlertTriangle size={32} color="var(--danger-color)" />
          <div>
            <h3 style={{ margin: 0, color: 'var(--danger-color)' }}>Attention Needed</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>You have {stats.overdue} overdue task(s).</p>
          </div>
        </div>
      )}

      {stats.tasksPerUser && stats.tasksPerUser.length > 0 && (
        <div className="card mt-8">
          <h3 className="mb-4">Tasks Per User</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {stats.tasksPerUser.map((userStat, index) => (
              <div key={index} className="flex justify-between items-center p-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 500 }}>{userStat.name}</span>
                <span className="badge badge-progress">{userStat.count} Task(s)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
