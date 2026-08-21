import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Camera, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import './TeacherPages.css';
import '../parent/ParentPages.css';

export default function TeacherPhotos() {
  const { allPhotos, addPhoto, updatePhoto, deletePhoto } = useAuth();
  const location = useLocation();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [imageUrl, setImageUrl] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [description, setDescription] = useState('');

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
    setImageUrl('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800');
    setActivityTitle('');
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditMode(true);
    setCurrentId(p.id);
    setImageUrl(p.imageUrl);
    setActivityTitle(p.activityTitle);
    setDescription(p.description);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this photo?')) {
      deletePhoto(id);
      showFeedback('Photo deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl.trim() || !activityTitle.trim() || !description.trim()) return;

    if (editMode) {
      updatePhoto(currentId, {
        imageUrl: imageUrl.trim(),
        activityTitle: activityTitle.trim(),
        description: description.trim()
      });
      showFeedback('✓ Photo details updated successfully');
    } else {
      addPhoto(imageUrl.trim(), activityTitle.trim(), description.trim());
      showFeedback('✓ Photo uploaded successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="page-container">
      <header className="page-header flex-header">
        <div>
          <h1>Classroom Photos</h1>
          <p>Share moments with parents.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} /> Upload Photo
        </button>
      </header>

      {toastMessage && (
        <div className="toast-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="photo-grid">
        {allPhotos.map(photo => (
          <div key={photo.id} className="card photo-card">
            <img src={photo.imageUrl} alt={photo.activityTitle} className="photo-image" />
            <div className="photo-content">
              <div className="photo-header">
                <h3><Camera size={18} /> {photo.activityTitle}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="action-icon-btn edit" 
                    onClick={() => handleOpenEdit(photo)} 
                    style={{ padding: '0.25rem' }}
                    title="Edit Details"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="action-icon-btn delete" 
                    onClick={() => handleDelete(photo.id)} 
                    style={{ padding: '0.25rem' }}
                    title="Delete Photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p>{photo.description}</p>
              <span className="photo-date" style={{ display: 'block', marginTop: '0.5rem' }}>
                {format(parseISO(photo.date), 'MMM do, yyyy')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
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
              {editMode ? 'Edit Photo Details' : 'Upload Classroom Photo'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Image URL</label>
                <input 
                  type="url" 
                  className="form-control" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Activity Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={activityTitle} 
                  placeholder="e.g. Science Lab Experiment"
                  onChange={(e) => setActivityTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Description</label>
                <textarea 
                  className="form-control" 
                  value={description} 
                  placeholder="Describe the activity..."
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={3}
                  required 
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editMode ? 'Save Changes' : 'Upload'}
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
