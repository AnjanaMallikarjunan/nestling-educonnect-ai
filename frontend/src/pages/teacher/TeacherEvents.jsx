import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Clock, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import './TeacherPages.css';
import '../parent/ParentPages.css';

export default function TeacherEvents() {
  const { allEvents, addEvent, updateEvent, deleteEvent } = useAuth();

  // Sort events by date ascending
  const sortedEvents = [...allEvents].sort((a, b) => parseISO(a.date) - parseISO(b.date));

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  // Feedback State
  const [toastMessage, setToastMessage] = useState('');

  const showFeedback = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenCreate = () => {
    setEditMode(false);
    setCurrentId(null);
    setTitle('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime('10:00 - 12:00');
    setLocation('');
    setModalOpen(true);
  };

  const handleOpenEdit = (ev) => {
    setEditMode(true);
    setCurrentId(ev.id);
    setTitle(ev.title);
    setDescription(ev.description);
    setDate(format(parseISO(ev.date), 'yyyy-MM-dd'));
    setTime(ev.time);
    setLocation(ev.location);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEvent(id);
      showFeedback('Event deleted successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date || !time.trim() || !location.trim()) return;

    if (editMode) {
      updateEvent(currentId, {
        title: title.trim(),
        description: description.trim(),
        date,
        time: time.trim(),
        location: location.trim()
      });
      showFeedback('✓ Event details updated successfully');
    } else {
      addEvent(title.trim(), description.trim(), date, time.trim(), location.trim());
      showFeedback('✓ Event scheduled successfully');
    }
    setModalOpen(false);
  };

  return (
    <div className="page-container">
      <header className="page-header flex-header">
        <div>
          <h1>Manage Events</h1>
          <p>Schedule upcoming school events.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <Plus size={18} /> New Event
        </button>
      </header>

      {toastMessage && (
        <div className="toast-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="manage-list">
        {sortedEvents.map(event => (
          <div key={event.id} className="card manage-card">
            <div className="manage-card-content">
              <div className="event-date-block" style={{ display: 'inline-block', padding: '0.5rem', float: 'right', marginLeft: '1rem' }}>
                <span className="event-month" style={{ display: 'block', textAlign: 'center' }}>{format(parseISO(event.date), 'MMM')}</span>
                <span className="event-day" style={{ display: 'block', textAlign: 'center' }}>{format(parseISO(event.date), 'dd')}</span>
              </div>
              
              <h2>{event.title}</h2>
              <p className="event-desc">{event.description}</p>
              
              <div className="event-meta">
                <span><Clock size={16} /> {event.time}</span>
                <span><MapPin size={16} /> {event.location}</span>
              </div>
            </div>
            
            <div className="manage-actions">
              <button 
                className="action-icon-btn edit" 
                onClick={() => handleOpenEdit(event)}
                title="Edit Event"
              >
                <Edit2 size={18} />
              </button>
              <button 
                className="action-icon-btn delete" 
                onClick={() => handleDelete(event.id)}
                title="Delete Event"
              >
                <Trash2 size={18} />
              </button>
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
              {editMode ? 'Edit Scheduled Event' : 'Schedule New Event'}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Event Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={title} 
                  placeholder="e.g. Science Fair"
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Description</label>
                <textarea 
                  className="form-control" 
                  value={description} 
                  placeholder="Details about the event..."
                  onChange={(e) => setDescription(e.target.value)} 
                  rows={3}
                  required 
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Time Range</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={time} 
                  placeholder="e.g. 09:00 - 15:00"
                  onChange={(e) => setTime(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Location</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={location} 
                  placeholder="e.g. Main Auditorium"
                  onChange={(e) => setLocation(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editMode ? 'Save Changes' : 'Schedule'}
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
