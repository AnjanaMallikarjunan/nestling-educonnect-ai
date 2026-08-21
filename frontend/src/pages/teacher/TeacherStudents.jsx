import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isToday, parseISO } from 'date-fns';
import { User, Activity, Clock, X, Check, Star } from 'lucide-react';
import './TeacherPages.css';

export default function TeacherStudents() {
  const { currentUser, allStudents, allDailyProgress, updateDailyProgress } = useAuth();
  const classStudents = allStudents.filter(s => s.teacherId === currentUser?.id);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form State
  const [attendance, setAttendance] = useState('Present');
  const [academicRating, setAcademicRating] = useState(5);
  const [behaviourRating, setBehaviourRating] = useState(5);
  const [participationRating, setParticipationRating] = useState(5);
  const [teacherNote, setTeacherNote] = useState('');

  // Feedback State
  const [toastMessage, setToastMessage] = useState('');

  const showFeedback = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleOpenUpdate = (student, todayProg) => {
    setSelectedStudent(student);
    if (todayProg) {
      setAttendance(todayProg.attendance);
      setAcademicRating(todayProg.academicRating);
      setBehaviourRating(todayProg.behaviourRating);
      setParticipationRating(todayProg.participationRating);
      setTeacherNote(todayProg.teacherNote || '');
    } else {
      setAttendance('Present');
      setAcademicRating(5);
      setBehaviourRating(5);
      setParticipationRating(5);
      setTeacherNote('');
    }
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    updateDailyProgress(
      selectedStudent.id,
      attendance,
      academicRating,
      behaviourRating,
      participationRating,
      teacherNote.trim()
    );

    showFeedback(`✓ Daily progress updated for ${selectedStudent.name}`);
    setModalOpen(false);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Students & Progress</h1>
        <p>Manage your class roster and update daily progress.</p>
      </header>

      {toastMessage && (
        <div className="toast-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="students-grid">
        {classStudents.map(student => {
          // Find progress matching today
          const todayProg = allDailyProgress.find(
            p => p.studentId === student.id && isToday(parseISO(p.date))
          );
          
          return (
            <div key={student.id} className="card student-card">
              <div className="student-header">
                <img src={student.profileImage} alt={student.name} className="student-avatar" />
                <div>
                  <h3>{student.name}</h3>
                  <span className={`badge ${todayProg?.attendance === 'Present' ? 'badge-general' : (todayProg ? 'badge-urgent' : 'badge-important')}`}>
                    {todayProg ? todayProg.attendance : 'Not Marked'}
                  </span>
                </div>
              </div>
              
              <div className="student-quick-stats">
                <div className="stat-sm">
                  <Activity size={16} />
                  <span>{todayProg ? `${todayProg.academicRating}/5 Academic` : 'No rating yet'}</span>
                </div>
                <div className="stat-sm">
                  <Clock size={16} />
                  <span>Last updated: {todayProg ? 'Today' : 'Not updated today'}</span>
                </div>
              </div>
              
              <button 
                className="btn btn-secondary update-btn" 
                onClick={() => handleOpenUpdate(student, todayProg)}
              >
                Update Progress
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog */}
      {modalOpen && selectedStudent && (
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
              Update Progress: {selectedStudent.name}
            </h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Attendance</label>
                <select 
                  className="form-control" 
                  value={attendance} 
                  onChange={(e) => setAttendance(e.target.value)}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Academic Rating (1-5)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      type="button" 
                      key={star} 
                      onClick={() => setAcademicRating(star)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Star 
                        size={24} 
                        fill={star <= academicRating ? 'var(--color-accent)' : 'none'} 
                        color="var(--color-accent)" 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Participation Rating (1-5)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      type="button" 
                      key={star} 
                      onClick={() => setParticipationRating(star)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Star 
                        size={24} 
                        fill={star <= participationRating ? 'var(--color-accent)' : 'none'} 
                        color="var(--color-accent)" 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Behaviour Rating (1-5)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      type="button" 
                      key={star} 
                      onClick={() => setBehaviourRating(star)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Star 
                        size={24} 
                        fill={star <= behaviourRating ? 'var(--color-accent)' : 'none'} 
                        color="var(--color-accent)" 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Teacher's Remarks / Notes</label>
                <textarea 
                  className="form-control" 
                  value={teacherNote} 
                  placeholder="e.g. Excellent behavior, participated enthusiastically today!"
                  onChange={(e) => setTeacherNote(e.target.value)} 
                  rows={3}
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Changes
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
