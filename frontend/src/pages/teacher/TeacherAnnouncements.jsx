import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Megaphone, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import './TeacherPages.css';
import '../parent/ParentPages.css';

export default function TeacherAnnouncements() {
  const { 
    currentUser, 
    allAnnouncements, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement 
  } = useAuth();

  const location = useLocation();

  // Filter announcements for the teacher
  const myAnnouncements = allAnnouncements.filter(
    a => a.createdBy === currentUser?.name || a.createdBy === 'Principal'
  );

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('general');

  // Feedback State
  const [toastMessage, setToastMessage] = useState('');

  const showFeedback = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate();
      // Clear route state to prevent auto-reopen on browser reload
      try {
        window.history.replaceState({}, document.title);
      } catch (e) {}
    }
  }, [location]);

  const handleOpenCreate = () => {
    setEditMode(false);
    setCurrentId(null);
    setTitle('');
    setDescription('');
    setPriority('general');
    setModalOpen(true);
  };

  const handleOpenEdit = (ann) => {
    setEditMode(true);
    setCurrentId(ann.id);
    setTitle(ann.title);
    setDescription(ann.description);
    setPriority(ann.priority);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id);
      showFeedback('Announcement deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    if (editMode) {
      updateAnnouncement(currentId, {
        title: title.trim(),
        description: description.trim(),
        priority
      });
      showFeedback('✓ Announcement updated successfully');
    } else {
      addAnnouncement(title.trim(), description.trim(), priority);
      showFeedback('✓ Announcement published successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="page-container">
      <header className="page-header flex-header">
        <div>
          <h1>Manage Announcements</h1>
          <p>Publish and edit class announcements.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} /> New Announcement
        </button>
      </header>

      {toastMessage && (
        <div className="toast-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="manage-list">
        {myAnnouncements.map(ann => (
          <div key={ann.id} className="card manage-card">
            <div className="manage-card-content">
              <div className="announcement-header">
                <div className="title-group">
                  <Megaphone size={18} className={`icon-${ann.priority}`} />
                  <h2>{ann.title}</h2>
                </div>
                <span className={`badge badge-${ann.priority}`}>
                  {ann.priority.charAt(0).toUpperCase() + ann.priority.slice(1)}
                </span>
              </div>
              
              <p className="announcement-desc" style={{ marginTop: '0.5rem' }}>{ann.description}</p>
              
              <div className="announcement-footer">
                <span className="date">Published {format(parseISO(ann.date), 'MMM do, yyyy')}</span>
                <span>{ann.readBy?.length || 0} Reads</span>
              </div>
            </div>
            
            <div className="manage-actions">
              <button 
                className="action-icon-btn edit" 
                onClick={() => handleOpenEdit(ann)}
                title="Edit Announcement"
              >
                <Edit2 size={18} />
              </button>
              <button 
                className="action-icon-btn delete" 
                onClick={() => handleDelete(ann.id)} 
                disabled={ann.createdBy === 'Principal'} 
                title={ann.createdBy === 'Principal' ? "Can't delete principal's announcement" : "Delete Announcement"}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal dialog overlay */}
      {modalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card modal-content" style={{
            width: '90%', maxWidth: '500px', padding: '2rem',
            position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <button 
              onClick={() => setModalOpen(false)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
              {editMode ? 'Edit Announcement' : 'Publish New Announcement'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Description</label>
                <textarea 
                  className="form-control" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={4}
                  required 
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Priority</label>
                <select 
                  className="form-control" 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="general">General</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editMode ? 'Save Changes' : 'Publish'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
