

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { format, isToday, parseISO } from 'date-fns';
import { 
  Users, BookOpen, MessageSquare, Megaphone, CheckCircle, Camera, 
  Activity, Bell, X, Check, Settings, Calendar, AlertTriangle, Clock, FileText, Sun, Moon 
} from 'lucide-react';
import './TeacherPages.css';

export default function TeacherDashboard() {
  const { currentUser, allStudents, allHomework, allDailyProgress, allEvents, allLeaveRequests, allPasswordRequests } = useAuth();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeType, setChangeType] = useState('class');
  const [changeDetails, setChangeDetails] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);
  const [lastUpdated] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Theme Toggler
  const [theme, setTheme] = useState(() => {
    return document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  });

  const toggleTheme = () => {
    if (theme === 'light') {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      setTheme('dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      setTheme('light');
    }
  };

  // Report Card Update Modal State
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [mathGrade, setMathGrade] = useState('A');
  const [scienceGrade, setScienceGrade] = useState('A');
  const [englishGrade, setEnglishGrade] = useState('A');
  const [socialGrade, setSocialGrade] = useState('A');
  const [reportRemarks, setReportRemarks] = useState('');
  const [reportCardSuccess, setReportCardSuccess] = useState(false);

  // Calculate stats dynamically from context
  const classStudents = allStudents.filter(s => s.teacherId === currentUser?.id);
  const totalStudents = classStudents.length;
  
  // Today's attendance
  const todayProgress = allDailyProgress.filter(
    p => isToday(parseISO(p.date)) && classStudents.some(s => s.id === p.studentId)
  );
  const presentToday = todayProgress.filter(p => p.attendance === 'Present').length;
  
  // Pending Homework across all active assignments for this teacher
  const pendingHw = allHomework.filter(
    hw => hw.teacherId === currentUser?.id && hw.status === 'pending'
  ).length;

  // Mock teacher schedule data
  const teacherSchedule = [
    { period: 'Period 1', subject: 'Mathematics', time: '08:30 AM - 09:20 AM', room: 'Room 204B' },
    { period: 'Period 2', subject: 'Mathematics (Lab)', time: '09:30 AM - 10:20 AM', room: 'Computer Lab 1' },
    { period: 'Period 3', subject: 'Class Tutor Session', time: '10:30 AM - 11:00 AM', room: 'Room 204B' },
    { period: 'Period 4', subject: 'Calculus Support', time: '11:15 AM - 12:00 PM', room: 'Room 102' }
  ];

  // Mock flagged students (e.g. behaviour < 3, participation < 3, or high pending homework)
  const flaggedStudents = classStudents.filter((_, idx) => idx === 1 || idx === 3).map((student, idx) => ({
    id: student.id,
    name: student.name,
    reason: idx === 0 ? 'Participation rating dropped this week' : '2 pending homework assignments past due date'
  }));

  // Mock activity log
  const activityLog = [
    { text: 'Assigned new homework: Calculus Practice 4', time: 'Today, 10:45 AM', icon: BookOpen },
    { text: 'Marked daily attendance & behavioral parameters', time: 'Today, 09:10 AM', icon: CheckCircle },
    { text: 'Published announcement: Term 1 Math Exams', time: 'Yesterday', icon: Megaphone }
  ];

  const handleQuickAction = (action) => {
    if (action === 'Announcement') {
      navigate('/teacher/announcements', { state: { openCreate: true } });
    } else if (action === 'Homework') {
      navigate('/teacher/homework', { state: { openCreate: true } });
    } else if (action === 'Daily Progress') {
      navigate('/teacher/students');
    } else if (action === 'Upload Photos') {
      navigate('/teacher/photos', { state: { openCreate: true } });
    } else if (action === 'Mark Attendance') {
      navigate('/teacher/students');
    } else if (action === 'Update Report Card') {
      if (classStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(classStudents[0].id);
      }
      setShowReportCardModal(true);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1 className="greeting">Good evening, {currentUser?.name} 👋</h1>
          <p className="date">{format(new Date(), 'EEEE, MMMM do yyyy')}</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          {/* Theme Switcher Button */}
          <div 
            className="theme-toggle-btn card"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            style={{ 
              padding: '0.75rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 'var(--radius-md)',
              margin: 0
            }}
          >
            {theme === 'light' ? (
              <Moon size={22} color="var(--color-primary)" />
            ) : (
              <Sun size={22} color="var(--color-primary)" />
            )}
          </div>

          {/* Notification Icon */}
          <div 
            className="notification-bell card"
            onClick={() => setShowNotifications(!showNotifications)}
            title="View notifications"
            style={{ 
              padding: '0.75rem', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'relative',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <Bell size={22} color="var(--color-primary)" />
            {(allLeaveRequests.filter(r => r.status === 'pending').length + (allPasswordRequests || []).filter(r => r.status === 'pending').length) > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-4px', 
                right: '-4px', 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--color-urgent)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {allLeaveRequests.filter(r => r.status === 'pending').length + (allPasswordRequests || []).filter(r => r.status === 'pending').length}
              </span>
            )}
 
            {showNotifications && (
              <div 
                className="card"
                onClick={(e) => e.stopPropagation()} 
                style={{ 
                  position: 'absolute', 
                  top: '110%', 
                  right: 0, 
                  width: '320px', 
                  zIndex: 99, 
                  textAlign: 'left',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  Notifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
                  {allLeaveRequests.filter(r => r.status === 'pending').map(req => {
                    const student = allStudents.find(s => s.id === req.studentId);
                    return (
                      <div 
                        key={req.id} 
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/teacher/leaves');
                        }}
                        style={{ 
                          fontSize: '0.85rem', 
                          paddingBottom: '0.5rem', 
                          borderBottom: '1px solid var(--color-border)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: 'var(--color-urgent)' }}>Leave Application</div>
                        <div style={{ color: 'var(--color-text)', marginTop: '0.25rem' }}>
                          <strong>{student ? student.name : 'Student'}</strong> has applied for leave from {req.startDate} to {req.endDate}.
                        </div>
                      </div>
                    );
                  })}

                  {(allPasswordRequests || []).filter(r => r.status === 'pending').map(req => (
                    <div 
                      key={req.id} 
                      onClick={async () => {
                        setShowNotifications(false);
                        // Dismiss password request by resolving it (or editing on the page)
                        // Simply navigating to the edit directory is perfect
                        navigate('/teacher/create-parent');
                      }}
                      style={{ 
                        fontSize: '0.85rem', 
                        paddingBottom: '0.5rem', 
                        borderBottom: '1px solid var(--color-border)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: '600', color: 'var(--color-urgent)' }}>Password Reset Request</div>
                      <div style={{ color: 'var(--color-text)', marginTop: '0.25rem' }}>
                        <strong>{req.parentName}</strong> has requested to change their password.
                      </div>
                    </div>
                  ))}

                  {(allLeaveRequests.filter(r => r.status === 'pending').length === 0 && (allPasswordRequests || []).filter(r => r.status === 'pending').length === 0) && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                      No new notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div 
              className="teacher-profile-header-card card" 
              onClick={() => navigate('/teacher/profile')}
              title="View profile settings"
              style={{ margin: 0 }}
            >
              <img 
                src={currentUser?.profileImage || "https://api.dicebear.com/7.x/notionists/svg?seed=Teacher"} 
                alt={currentUser?.name} 
                className="teacher-avatar-dashboard" 
              />
              <div className="teacher-info-dashboard">
                <h2>{currentUser?.name}</h2>
                <p>{currentUser?.class || 'Class Teacher'}</p>
              </div>
            </div>
            <button 
              onClick={() => setShowChangeModal(true)}
              className="btn btn-secondary"
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: 'var(--color-primary)',
                margin: 0
              }}
            >
              <Settings size={14} /> Request to Change details
            </button>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <button className="action-btn card" onClick={() => handleQuickAction('Announcement')}>
            <div className="action-icon action-megaphone"><Megaphone size={24} /></div>
            <span>+ Announcement</span>
          </button>
          
          <button className="action-btn card" onClick={() => handleQuickAction('Homework')}>
            <div className="action-icon action-book"><BookOpen size={24} /></div>
            <span>+ Homework</span>
          </button>
          
          <button className="action-btn card" onClick={() => handleQuickAction('Daily Progress')}>
            <div className="action-icon action-activity"><Activity size={24} /></div>
            <span>+ Daily Progress</span>
          </button>

          <button className="action-btn card" onClick={() => handleQuickAction('Mark Attendance')}>
            <div className="action-icon action-attendance"><CheckCircle size={24} /></div>
            <span>Mark Attendance</span>
          </button>

          <button className="action-btn card" onClick={() => handleQuickAction('Update Report Card')}>
            <div className="action-icon action-report"><FileText size={24} /></div>
            <span>Update Report Card</span>
          </button>
          
          <button className="action-btn card" onClick={() => handleQuickAction('Upload Photos')}>
            <div className="action-icon action-camera"><Camera size={24} /></div>
            <span>+ Upload Photos</span>
          </button>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="stats-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Class Overview</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Last updated at {lastUpdated}</span>
        </div>
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-icon"><Users size={24} /></div>
            <div className="stat-info">
              <h3>{totalStudents}</h3>
              <p>Total Students</p>
            </div>
          </div>
          
          <div className="stat-card card">
            <div className="stat-icon stat-success"><CheckCircle size={24} /></div>
            <div className="stat-info">
              <h3>{presentToday}/{totalStudents}</h3>
              <p>Present Today</p>
            </div>
          </div>
          
          <div className="stat-card card">
            <div className="stat-icon stat-warning"><BookOpen size={24} /></div>
            <div className="stat-info">
              <h3>{pendingHw}</h3>
              <p>Pending Homework</p>
            </div>
          </div>
          
          <div className="stat-card card">
            <div className="stat-icon stat-urgent"><MessageSquare size={24} /></div>
            <div className="stat-info">
              <h3>2</h3>
              <p>Unread Messages</p>
            </div>
          </div>
        </div>
      </section>

      {/* Double Column Dashboard Widgets */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Roster & Timetable Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Today's Timetable */}
          <section className="card">
            <h2 className="section-title"><Clock size={20} color="var(--color-primary)" /> Today's Timetable</h2>
            <div className="timetable-list">
              {teacherSchedule.map((slot, idx) => (
                <div key={idx} className="timetable-item">
                  <div>
                    <span className="timetable-time">{slot.time}</span>
                    <div className="timetable-subject">{slot.subject}</div>
                  </div>
                  <span className="timetable-room">{slot.room}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Student Roster */}
          <section className="card" style={{ overflowX: 'auto' }}>
            <h2 className="section-title"><Users size={20} color="var(--color-primary)" /> Student Roster ({currentUser?.class || 'Class'})</h2>
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Attendance</th>
                  <th>Pending Homework</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.slice(0, 5).map((student) => {
                  const hasMarkedAttendance = todayProgress.some(p => p.studentId === student.id);
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="roster-student-info">
                          <img src={student.profileImage} alt={student.name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                          <span>{student.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-indicator ${hasMarkedAttendance ? 'status-marked' : 'status-pending'}`}>
                          {hasMarkedAttendance ? 'Marked' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {pendingHw}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>

        {/* Flagged, Activities & Events Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Flagged Students / Needs Attention */}
          <section className="card">
            <h2 className="section-title"><AlertTriangle size={20} color="var(--color-urgent)" /> Needs Attention</h2>
            <div className="flagged-list">
              {flaggedStudents.map((flag) => (
                <div key={flag.id} className="flagged-card">
                  <div className="flagged-info">
                    <span className="flagged-name">{flag.name}</span>
                    <span className="flagged-reason">{flag.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity Log */}
          <section className="card">
            <h2 className="section-title"><Activity size={20} color="var(--color-primary)" /> Recent Activities</h2>
            <div className="activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activityLog.map((act, idx) => (
                <div key={idx} className="activity-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <div className="activity-icon" style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary)', display: 'flex', padding: '0.4rem', borderRadius: '4px' }}>
                    <act.icon size={16} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{act.text}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Events widget (Mirrored from parent) */}
          <section className="card">
            <h2 className="section-title"><Calendar size={20} color="var(--color-primary)" /> Upcoming School Events</h2>
            <div className="event-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {allEvents.slice(0, 2).map(event => (
                <div key={event.id} className="event-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <Calendar size={20} className="event-icon" style={{ padding: '0.4rem', background: 'var(--color-general-bg)', color: 'var(--color-general)', borderRadius: '4px', boxSizing: 'content-box' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{event.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{format(parseISO(event.date), 'MMM do')} • {event.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>

      {showChangeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              type="button" 
              onClick={() => setShowChangeModal(false)}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Request Profile Change</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Submit a request to the school administration to update your portal assignments or details.
            </p>

            {changeSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Check size={28} />
                </div>
                <h3>Request Submitted</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Your request has been sent to school administration for review.</p>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                setChangeSuccess(true);
                setTimeout(() => {
                  setChangeSuccess(false);
                  setShowChangeModal(false);
                  setChangeDetails('');
                }, 2000);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label htmlFor="change-type">Request Option</label>
                  <select 
                    id="change-type"
                    className="form-control"
                    value={changeType}
                    onChange={(e) => setChangeType(e.target.value)}
                    required
                  >
                    <option value="class">Change Assigned Class / Subject</option>
                    <option value="office">Change Office Hours</option>
                    <option value="name">Change Name Spelling</option>
                    <option value="other">Other Account Details</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label htmlFor="change-details">Details & Justification</label>
                  <textarea 
                    id="change-details"
                    className="form-control" 
                    placeholder="Describe the requested updates here..."
                    rows={4}
                    value={changeDetails}
                    onChange={(e) => setChangeDetails(e.target.value)}
                    required
                    style={{ resize: 'none' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Submit Change Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Update Report Card Modal */}
      {showReportCardModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <button 
              type="button" 
              onClick={() => {
                setShowReportCardModal(false);
                setReportCardSuccess(false);
              }}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Update Student Report Card</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Select a student to edit or publish their current term grades.
            </p>

            {reportCardSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Check size={28} />
                </div>
                <h3>Report Card Published</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Grades have been synchronized with the parent portal database.</p>
              </div>
            ) : (
              <form onSubmit={(e) => {
                e.preventDefault();
                setReportCardSuccess(true);
                setTimeout(() => {
                  setReportCardSuccess(false);
                  setShowReportCardModal(false);
                  setMathGrade('A');
                  setScienceGrade('A');
                  setEnglishGrade('A');
                  setSocialGrade('A');
                  setReportRemarks('');
                }, 2000);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label htmlFor="student-select" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Select Student</label>
                  <select 
                    id="student-select"
                    className="form-control"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    required
                  >
                    {classStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label htmlFor="math-grade" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Mathematics Grade</label>
                    <select id="math-grade" className="form-control" value={mathGrade} onChange={(e) => setMathGrade(e.target.value)}>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label htmlFor="science-grade" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Science Grade</label>
                    <select id="science-grade" className="form-control" value={scienceGrade} onChange={(e) => setScienceGrade(e.target.value)}>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label htmlFor="english-grade" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>English Grade</label>
                    <select id="english-grade" className="form-control" value={englishGrade} onChange={(e) => setEnglishGrade(e.target.value)}>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label htmlFor="social-grade" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Social Studies Grade</label>
                    <select id="social-grade" className="form-control" value={socialGrade} onChange={(e) => setSocialGrade(e.target.value)}>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label htmlFor="report-remarks" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Teacher Remarks</label>
                  <textarea 
                    id="report-remarks"
                    className="form-control" 
                    placeholder="Provide term feedback..."
                    rows={3}
                    value={reportRemarks}
                    onChange={(e) => setReportRemarks(e.target.value)}
                    required
                    style={{ resize: 'none' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Publish Report Card
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
