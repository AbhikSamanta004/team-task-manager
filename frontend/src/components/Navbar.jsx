import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiLogOut, FiLayout, FiFolder } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container flex items-center justify-between">
        <Link to="/" className="nav-brand">
          <span>Pulse</span>TaskManager
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <div className="flex items-center gap-2"><FiLayout /> Dashboard</div>
          </Link>
          <Link to="/projects" className={`nav-link ${location.pathname.startsWith('/projects') ? 'active' : ''}`}>
            <div className="flex items-center gap-2"><FiFolder /> Projects</div>
          </Link>
          <div className="flex items-center gap-4" style={{ marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
            <div className="flex-col">
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary flex items-center gap-2">
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
