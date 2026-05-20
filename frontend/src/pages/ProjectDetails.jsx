import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiPlus, FiUsers, FiClock, FiCheckCircle } from 'react-icons/fi';
import Modal from '../components/Modal';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'Medium', assignedTo: '' });
  const [memberForm, setMemberForm] = useState({ memberId: '' });

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      
      if (user._id === projRes.data.admin._id) {
        const usersRes = await api.get('/auth/users');
        setAllUsers(usersRes.data);
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 403) {
        navigate('/projects');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...taskForm, project: id });
      setIsTaskModalOpen(false);
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'Medium', assignedTo: '' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}/members`, memberForm);
      setIsMemberModalOpen(false);
      setMemberForm({ memberId: '' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'Done': return 'badge-done';
      case 'In Progress': return 'badge-progress';
      default: return 'badge-todo';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch(priority) {
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return '';
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2>{project.name}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{project.description}</p>
        </div>
        
        {user._id === project.admin._id && (
          <div className="flex gap-4">
            <button className="btn btn-secondary flex items-center gap-2" onClick={() => setIsMemberModalOpen(true)}>
              <FiUsers /> Add Member
            </button>
            <button className="btn btn-primary flex items-center gap-2" onClick={() => setIsTaskModalOpen(true)}>
              <FiPlus /> Create Task
            </button>
          </div>
        )}
      </div>

      <div className="mb-8 p-4 glass flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
        <strong>Team Members:</strong>
        <span className="badge flex items-center gap-1" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>{project.admin.name} (Admin)</span>
        {project.members.map(m => (
          <span key={m._id} className="badge flex items-center gap-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            {m.name}
            {user._id === project.admin._id && (
              <button 
                onClick={() => handleRemoveMember(m._id)}
                style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                title="Remove Member"
              >
                &times;
              </button>
            )}
          </span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {tasks.map(task => (
          <div key={task._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-start mb-2">
              <h4 style={{ margin: 0 }}>{task.title}</h4>
              <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', flex: 1 }}>{task.description}</p>
            
            <div className="flex justify-between items-center mt-auto pt-4" style={{ borderTop: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
              <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                <FiClock /> {new Date(task.dueDate).toLocaleDateString()}
              </div>
              <div>
                {task.assignedTo && <span style={{ marginRight: '0.5rem', color: 'var(--text-secondary)' }}>{task.assignedTo.name}</span>}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className={`badge ${getStatusBadgeClass(task.status)}`}>{task.status}</span>
              {(user._id === project.admin._id || task.assignedTo?._id === user._id) && (
                <select 
                  className="form-control" 
                  style={{ width: 'auto', padding: '0.25rem 0.5rem', height: 'auto' }}
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              )}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No tasks found.
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Task">
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-control" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} required />
          </div>
          <div className="flex gap-4">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Due Date</label>
              <input type="date" className="form-control" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Priority</label>
              <select className="form-control" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Assign To</label>
            <select className="form-control" value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}>
              <option value="">Unassigned</option>
              {project.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              <option value={project.admin._id}>{project.admin.name} (Admin)</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" className="btn btn-secondary" onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Add Member">
        <form onSubmit={handleAddMember}>
          <div className="form-group">
            <label className="form-label">Select User</label>
            <select className="form-control" value={memberForm.memberId} onChange={e => setMemberForm({memberId: e.target.value})} required>
              <option value="">-- Select a User --</option>
              {allUsers.filter(u => u._id !== project.admin._id && !project.members.some(m => m._id === u._id)).map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" className="btn btn-secondary" onClick={() => setIsMemberModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Member</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
