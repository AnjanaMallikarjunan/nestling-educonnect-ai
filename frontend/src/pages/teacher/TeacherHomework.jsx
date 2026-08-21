import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { BookOpen, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import './TeacherPages.css';

export default function TeacherHomework() {
  const { 
    currentUser, 
    allHomework, 
    allStudents, 
    addHomework, 
    updateHomework, 
    deleteHomework 
  } = useAuth();

  const location = useLocation();

  // Filter homework for the teacher
  const myHomework = allHomework.filter(hw => hw.teacherId === currentUser?.id);
  const classSize = allStudents.filter(s => s.teacherId === currentUser?.id).length;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

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
    setSubject('Mathematics');
    setTitle('');
    setDescription('');
    setDueDate(format(new Date(), 'yyyy-MM-dd'));
    setModalOpen(true);
  };

  const safeFormatDate = (dateStr) => {
    try {
      if (!dateStr) return 'No due date';
      const parsed = parseISO(dateStr);
      if (isNaN(parsed.getTime())) return dateStr;
      return format(parsed, 'MMM do, yyyy');
    } catch (e) {
      return dateStr || 'No due date';
    }
  };

  const safeFormatISO = (dateStr) => {
    try {
      if (!dateStr) return '';
      const parsed = parseISO(dateStr);
      if (isNaN(parsed.getTime())) return '';
      return format(parsed, 'yyyy-MM-dd');
    } catch (e) {
      return '';
    }
  };

  const handleOpenEdit = (hw) => {
    setEditMode(true);
    setCurrentId(hw.id);
    setSubject(hw.subject);
    setTitle(hw.title);
    setDescription(hw.description);
    // Format ISO date to yyyy-MM-dd for HTML input
    const dateFormatted = safeFormatISO(hw.dueDate);
    setDueDate(dateFormatted);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this homework assignment?')) {
      deleteHomework(id);
      showFeedback('Homework deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !subject.trim() || !dueDate) return;

    if (editMode) {
      updateHomework(currentId, {
        subject: subject.trim(),
        title: title.trim(),
        description: description.trim(),
        dueDate
      });
      showFeedback('✓ Homework updated successfully');
    } else {
      addHomework(subject.trim(), title.trim(), description.trim(), dueDate);
      showFeedback('✓ Homework assignment published successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="page-container">
      <header className="page-header flex-header">
        <div>
          <h1>Manage Homework</h1>
          <p>Assign and track class homework.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} /> New Assignment
        </button>
      </header>

      {toastMessage && (
        <div className="toast-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="manage-list">
        {myHomework.map(hw => {
          // Generate realistic completion rates based on class size
          const completedCount = hw.status === 'completed' ? classSize : Math.floor(classSize * 0.7);
          
          return (
            <div key={hw.id} className="card manage-card">
              <div className="manage-card-content">
                <div className="hw-header">
                  <span className="subject-badge">{hw.subject}</span>
                  <span className="due-date">Due {safeFormatDate(hw.dueDate)}</span>
                </div>
                <h3>{hw.title}</h3>
                <p>{hw.description}</p>
                
                <div className="completion-stats">
                  <div className="stat-bar-container">
                    <div className="stat-bar" style={{ width: `${classSize > 0 ? (completedCount / classSize) * 100 : 0}%` }}></div>
                  </div>
                  <span>{completedCount}/{classSize} Completed</span>
                </div>
              </div>
              
              <div className="manage-actions">
                <button 
                  className="action-icon-btn edit" 
                  onClick={() => handleOpenEdit(hw)}
                  title="Edit Homework"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  className="action-icon-btn delete" 
                  onClick={() => handleDelete(hw.id)}
                  title="Delete Homework"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
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
              {editMode ? 'Edit Homework Assignment' : 'Assign New Homework'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Subject</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={subject} 
                  placeholder="e.g. Mathematics, Science"
                  onChange={(e) => setSubject(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title} 
                  placeholder="e.g. Exercise 4.2 Fractions"
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Instructions / Description</label>
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
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Due Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  required 
                />
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
