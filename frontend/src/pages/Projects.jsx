import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiPlus, FiFolder } from 'react-icons/fi';
import Modal from '../components/Modal';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project', error);
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Projects</h2>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center p-8">
          <FiFolder size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem' }} />
          <h3 className="mb-2">No Projects Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You are not assigned to any projects yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {projects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`} className="card" style={{ display: 'block', color: 'inherit' }}>
              <h3>{project.name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {project.description}
              </p>
              <div className="flex justify-between items-center text-sm" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <span>{project.members.length} member(s)</span>
                {project.admin._id === user._id && <span className="badge badge-progress">Admin</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required 
            ></textarea>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Project</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
