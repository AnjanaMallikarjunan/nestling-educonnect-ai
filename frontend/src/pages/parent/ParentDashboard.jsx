import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { format, isTomorrow, isToday, parseISO } from 'date-fns';
import { 
  AlertCircle, Clock, Calendar as CalendarIcon, Star, Bell, 
  MessageSquare, FileText, CalendarCheck, TrendingUp, CreditCard, ChevronDown, Sun, Moon 
} from 'lucide-react';
import WeeklySummary from '../../components/WeeklySummary';
import './ParentDashboard.css';

export default function ParentDashboard() {
  const { currentUser, allStudents, allAnnouncements, allHomework, allDailyProgress, allEvents, submitLeaveRequest } = useAuth();
  const navigate = useNavigate();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChildSwitcher, setShowChildSwitcher] = useState(false);
  const [activeChildId, setActiveChildId] = useState(currentUser?.childId || 'student_1');
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

  // Modals state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveSuccess, setLeaveSuccess] = useState(false);

  // Get children associated with this parent
  const parentChildren = allStudents.filter(s => s.parentId === currentUser?.id);
  
  // Get active child details
  const child = allStudents.find(s => s.id === activeChildId) || allStudents.find(s => s.id === currentUser?.childId);
  
  if (!child) return <div>Loading dashboard data...</div>;

  const studentProgress = allDailyProgress.filter(p => p.studentId === child.id);
  const avgAcademic = studentProgress.length > 0
    ? studentProgress.reduce((sum, p) => sum + (p.academicRating || 0), 0) / studentProgress.length
    : 4.0;
  const avgBehaviour = studentProgress.length > 0
    ? studentProgress.reduce((sum, p) => sum + (p.behaviourRating || 0), 0) / studentProgress.length
    : 4.0;
  const basePct = Math.round((avgAcademic / 5) * 100);

  const getSubjectGrade = (subjectName) => {
    const str = (child.id || '') + subjectName;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const offset = (Math.abs(hash) % 14) - 8;
    let pct = basePct + offset;
    if (pct > 100) pct = 100;
    if (pct < 40) pct = 40;

    let grade = 'F';
    if (pct >= 95) grade = 'A+';
    else if (pct >= 90) grade = 'A';
    else if (pct >= 85) grade = 'A-';
    else if (pct >= 80) grade = 'B+';
    else if (pct >= 75) grade = 'B';
    else if (pct >= 70) grade = 'B-';
    else if (pct >= 65) grade = 'C+';
    else if (pct >= 60) grade = 'C';
    else if (pct >= 50) grade = 'D';

    return `${grade} (${pct}%)`;
  };

  const getRemarks = () => {
    if (avgAcademic >= 4.5 && avgBehaviour >= 4.5) {
      return `${child.name} has performed outstandingly across all areas, demonstrating excellent academic skills and exemplary conduct.`;
    }
    if (avgAcademic >= 4.0) {
      return `${child.name} is showing excellent progress academically with consistent classroom participation.`;
    }
    if (avgAcademic >= 3.0) {
      return `${child.name} has achieved solid performance this term. Continuing to focus during classroom activities will yield even better results.`;
    }
    return `${child.name} has shown potential, but requires additional support and closer attention to daily lessons to improve performance.`;
  };

  // Filter data for the active child
  const childHomework = allHomework.filter(
    hw => hw.status === 'pending' && (hw.teacherId === child.teacherId)
  );
  const urgentAnnouncements = allAnnouncements.filter(a => a.priority === 'urgent');
  const todayProgress = allDailyProgress.find(p => {
    try {
      return p.studentId === child.id && p.date && isToday(parseISO(p.date));
    } catch (e) {
      return false;
    }
  });

  // Mock rating labels for accessibility
  const ratingLabels = {
    5: '5/5 – Excellent',
    4: '4/5 – Good',
    3: '3/5 – Average',
    2: '2/5 – Fair',
    1: '1/5 – Poor'
  };

  // Mock attendance history for active child
  const attendanceStreak = [
    { day: 'M', status: 'P' },
    { day: 'T', status: 'P' },
    { day: 'W', status: 'P' },
    { day: 'T', status: 'A' },
    { day: 'F', status: 'P' },
    { day: 'M', status: 'P' },
    { day: 'T', status: 'P' }
  ];

  // Recent activity list
  const recentActivities = [
    { id: 1, type: 'attendance', text: 'Daily attendance marked: Present', time: 'Today, 9:00 AM' },
    { id: 2, type: 'homework', text: 'New Science homework assigned', time: 'Yesterday' },
    { id: 3, type: 'announcement', text: 'School closed announcement published', time: '2 days ago' }
  ];

  // Mock student schedule data
  const studentSchedule = [
    { period: 'Period 1', subject: 'Mathematics', time: '08:30 AM - 09:20 AM', room: 'Room 204B' },
    { period: 'Period 2', subject: 'Environmental Studies', time: '09:30 AM - 10:20 AM', room: 'Science Lab 2' },
    { period: 'Period 3', subject: 'Recess', time: '10:30 AM - 11:00 AM', room: 'School Cafeteria' },
    { period: 'Period 4', subject: 'English Grammar', time: '11:15 AM - 12:00 PM', room: 'Room 204B' }
  ];

  const safeFormatDate = (dateStr) => {
    try {
      if (!dateStr) return 'No due date';
      const parsed = parseISO(dateStr);
      if (isNaN(parsed.getTime())) return dateStr;
      return format(parsed, 'MMM do');
    } catch (e) {
      return dateStr || 'No due date';
    }
  };

  const formatHomeworkDue = (dueDate) => {
    try {
      if (!dueDate) return 'No due date';
      const parsed = parseISO(dueDate);
      if (isNaN(parsed.getTime())) return dueDate;
      if (isTomorrow(parsed)) return 'Tomorrow';
      if (isToday(parsed)) return 'Today';
      return format(parsed, 'MMM do');
    } catch (e) {
      return dueDate || 'No due date';
    }
  };

  const safeFormatEventDate = (dateStr) => {
    try {
      if (!dateStr) return 'No date';
      const parsed = parseISO(dateStr);
      if (isNaN(parsed.getTime())) return dateStr;
      return format(parsed, 'MMM do');
    } catch (e) {
      return dateStr || 'No date';
    }
  };

  // Dynamic Parent Notifications
  const parentNotifications = [
    ...allAnnouncements.slice(0, 2).map(ann => ({
      id: ann.id,
      title: `Announcement: ${ann.title}`,
      desc: ann.description
    })),
    ...childHomework.slice(0, 2).map(hw => ({
      id: hw.id,
      title: `New Homework: ${hw.subject}`,
      desc: `${hw.title} - Due ${safeFormatDate(hw.dueDate)}`
    }))
  ];

  const handleChildSwitch = (id) => {
    setActiveChildId(id);
    setShowChildSwitcher(false);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="date-container">
          <h1 className="greeting">Good evening, {currentUser.name} 👋</h1>
          <p className="date">{format(new Date(), 'EEEE, MMMM do yyyy')}</p>
          <span className="timestamp">Last updated at {lastUpdated}</span>
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
              borderRadius: 'var(--radius-md)',
              margin: 0
            }}
          >
            <Bell size={22} color="var(--color-primary)" />
            <span style={{ 
              position: 'absolute', 
              top: '8px', 
              right: '8px', 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--color-urgent)' 
            }} />

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
                  boxShadow: 'var(--shadow-lg)',
                  maxHeight: '350px',
                  overflowY: 'auto'
                }}
              >
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  Notifications ({parentNotifications.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {parentNotifications.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', padding: '0.5rem 0' }}>No new notifications.</div>
                  ) : (
                    parentNotifications.map(n => (
                      <div key={n.id} style={{ fontSize: '0.85rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{n.title}</div>
                        <div style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.8rem' }}>{n.desc}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Clickable parent profile card */}
          <div 
            className="parent-profile card" 
            style={{ 
              margin: 0, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.5rem 0.75rem', 
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}
            onClick={() => navigate('/parent/profile')}
            title="View parent profile"
          >
            <img 
              src={currentUser.profileImage || "https://api.dicebear.com/7.x/notionists/svg?seed=Parent"} 
              alt={currentUser.name} 
              style={{ width: '32px', height: '32px', borderRadius: '50%' }} 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{currentUser.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Parent Profile</span>
            </div>
          </div>

          {/* Clickable child profile card */}
          <div 
            className="child-profile card" 
            style={{ margin: 0 }}
            onClick={() => navigate('/parent/profile')}
            title="View student profile"
          >
            <img src={child.profileImage} alt={child.name} className="child-avatar" />
            <div className="child-info">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {child.name} <ChevronDown size={14} />
              </h2>
              <p>{child.class}</p>
            </div>

            {/* Child Switcher Dropdown */}
            {showChildSwitcher && parentChildren.length > 1 && (
              <div className="child-dropdown card" onClick={(e) => e.stopPropagation()}>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', padding: '0 0.5rem' }}>Select Child</p>
                {parentChildren.map(c => (
                  <div 
                    key={c.id} 
                    className={`child-dropdown-item ${c.id === child.id ? 'active' : ''}`}
                    onClick={() => handleChildSwitch(c.id)}
                  >
                    <img src={c.profileImage} alt={c.name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Actions Bar */}
      <section className="quick-actions-section">
        <div className="quick-actions-bar" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div 
            className="quick-action-card card" 
            onClick={() => setShowLeaveModal(true)}
            title="Submit a leave request"
          >
            <div className="quick-action-icon-container" style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}>
              <CalendarCheck size={18} />
            </div>
            <span>Apply for Leave</span>
          </div>

          <div 
            className="quick-action-card card" 
            onClick={() => setShowReportModal(true)}
            title="View term grades"
          >
            <div className="quick-action-icon-container" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)' }}>
              <FileText size={18} />
            </div>
            <span>View Report Card</span>
          </div>
        </div>
      </section>

      {/* AI Weekly Summary */}
      <WeeklySummary studentName={child.name} studentId={child.id} />

      {/* Needs Your Attention (High Priority) */}
      <section className="attention-section">
        <h2 className="section-title">🔴 Needs Your Attention</h2>
        <div className="attention-grid">
          {urgentAnnouncements.length === 0 && childHomework.length === 0 ? (
            <div className="card" style={{ padding: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              No critical alerts or pending homework for {child.name}.
            </div>
          ) : (
            <>
              {urgentAnnouncements.map(ann => (
                <div key={ann.id} className="attention-card alert-urgent">
                  <AlertCircle size={24} />
                  <div>
                    <h3>{ann.title}</h3>
                    <p>{ann.description}</p>
                  </div>
                </div>
              ))}
              
              {childHomework.map(hw => (
                <div key={hw.id} className="attention-card alert-important">
                  <Clock size={24} />
                  <div>
                    <h3>Homework Due: {hw.subject}</h3>
                    <p>{hw.title} - Due {formatHomeworkDue(hw.dueDate)}</p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      <div className="dashboard-grid">
        {/* Daily Progress Snapshot */}
        <section className="progress-snapshot card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}>📈 Today's Progress</h2>
            <a onClick={() => navigate('/parent/progress')} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline' }}>
              View History →
            </a>
          </div>
          {todayProgress ? (
            <div className="progress-details">
              <div className="stat-row">
                <div className="stat-label-group">
                  <span>Academic</span>
                  <span className="rating-text">{ratingLabels[todayProgress.academicRating] || 'No rating'}</span>
                </div>
                <div className="stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < todayProgress.academicRating ? 'var(--color-important)' : 'none'} color="var(--color-important)" />)}
                </div>
              </div>
              <div className="stat-row">
                <div className="stat-label-group">
                  <span>Participation</span>
                  <span className="rating-text">{ratingLabels[todayProgress.participationRating] || 'No rating'}</span>
                </div>
                <div className="stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < todayProgress.participationRating ? 'var(--color-important)' : 'none'} color="var(--color-important)" />)}
                </div>
              </div>
              <div className="stat-row">
                <div className="stat-label-group">
                  <span>Behaviour</span>
                  <span className="rating-text">{ratingLabels[todayProgress.behaviourRating] || 'No rating'}</span>
                </div>
                <div className="stars">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < todayProgress.behaviourRating ? 'var(--color-important)' : 'none'} color="var(--color-important)" />)}
                </div>
              </div>
              
              {todayProgress.teacherNote && todayProgress.teacherNote.trim() !== "" ? (
                <div className="teacher-note">
                  <strong>Teacher's Note:</strong>
                  <p>"{todayProgress.teacherNote}"</p>
                </div>
              ) : (
                <div className="teacher-note" style={{ fontStyle: 'normal', color: 'var(--color-text-muted)' }}>
                  <strong>Teacher's Note:</strong>
                  <p>No note from teacher today.</p>
                </div>
              )}
            </div>
          ) : (
            <p className="empty-state">No progress updated for today yet.</p>
          )}
        </section>

        {/* Today's Timetable */}
        <section className="card">
          <h2 className="section-title"><Clock size={20} color="var(--color-primary)" /> Today's Timetable</h2>
          <div className="timetable-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {studentSchedule.map((slot, idx) => (
              <div key={idx} className="timetable-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div>
                  <span className="timetable-time" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{slot.time}</span>
                  <div className="timetable-subject" style={{ fontWeight: 600, fontSize: '0.95rem' }}>{slot.subject}</div>
                </div>
                <span className="timetable-room" style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'var(--color-primary-bg)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>{slot.room}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Attendance Widget */}
        <section className="attendance-snapshot card">
          <h2 className="section-title">🏫 Attendance</h2>
          <div className="attendance-grid">
            <div className="attendance-percentage">
              <h3>96%</h3>
              <span>Month MTD</span>
            </div>
            
            <div className="attendance-streak-container">
              <span className="attendance-streak-title">Recent 7 School Days</span>
              <div className="attendance-streak">
                {attendanceStreak.map((day, idx) => (
                  <div 
                    key={idx} 
                    className={`streak-dot ${day.status === 'P' ? 'streak-p' : 'streak-a'}`}
                    title={`${day.status === 'P' ? 'Present' : 'Absent'} on ${day.day}`}
                  >
                    {day.status}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity Feed */}
        <section className="activity-snapshot card">
          <h2 className="section-title">🕒 Recent Activity</h2>
          <div className="activity-list">
            {recentActivities.map(act => (
              <div key={act.id} className="activity-item">
                <div className="activity-icon">
                  {act.type === 'attendance' ? <TrendingUp size={16} /> : act.type === 'homework' ? <Clock size={16} /> : <AlertCircle size={16} />}
                </div>
                <div>
                  <h4>{act.text}</h4>
                  <p>{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events Snapshot */}
        <section className="events-snapshot card">
          <h2 className="section-title">📅 Upcoming Events</h2>
          <div className="event-list">
            {allEvents.slice(0, 2).map(event => (
              <div key={event.id} className="event-item">
                <CalendarIcon size={20} className="event-icon" />
                <div>
                  <h4>{event.title}</h4>
                  <p>{safeFormatEventDate(event.date)} • {event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              type="button" 
              onClick={() => {
                setShowLeaveModal(false);
                setLeaveSuccess(false);
              }}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', color: 'var(--color-text-muted)' }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>✕</span>
            </button>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Apply for Student Leave</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Submit a leave application for {child.name}.
            </p>

            {leaveSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>✓</span>
                </div>
                <h3>Application Submitted</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>The leave application has been sent to school administration and {child.name}'s class teacher.</p>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const success = await submitLeaveRequest(child.id, leaveStartDate, leaveEndDate, leaveReason);
                if (success) {
                  setLeaveSuccess(true);
                  setTimeout(() => {
                    setLeaveSuccess(false);
                    setShowLeaveModal(false);
                    setLeaveReason('');
                    setLeaveStartDate('');
                    setLeaveEndDate('');
                  }, 2500);
                }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: '0', flex: 1 }}>
                    <label htmlFor="leave-start" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Start Date</label>
                    <input 
                      id="leave-start"
                      type="date" 
                      className="form-control"
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '0', flex: 1 }}>
                    <label htmlFor="leave-end" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>End Date</label>
                    <input 
                      id="leave-end"
                      type="date" 
                      className="form-control"
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label htmlFor="leave-reason" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>Reason for Leave</label>
                  <textarea 
                    id="leave-reason"
                    className="form-control" 
                    placeholder="Provide details about the absence reason..."
                    rows={4}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                    style={{ resize: 'none' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem', backgroundColor: 'var(--color-primary)' }}
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Card Modal */}
      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <button 
              type="button" 
              onClick={() => setShowReportModal(false)}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', color: 'var(--color-text-muted)' }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>✕</span>
            </button>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Report Card - Term 1</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Final marks statement for {child.name} ({child.class}).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                <span>Subject</span>
                <span>Grade</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-bg)', fontSize: '0.9rem' }}>
                <span>Mathematics</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{getSubjectGrade('Mathematics')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-bg)', fontSize: '0.9rem' }}>
                <span>English Language</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{getSubjectGrade('English Language')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-bg)', fontSize: '0.9rem' }}>
                <span>Science & Technology</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{getSubjectGrade('Science & Technology')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-bg)', fontSize: '0.9rem' }}>
                <span>Social Studies</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{getSubjectGrade('Social Studies')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-bg)', fontSize: '0.9rem' }}>
                <span>Arts & Crafts</span>
                <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{getSubjectGrade('Arts & Crafts')}</span>
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <strong>Class Teacher Remarks:</strong>
                <p style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>"{getRemarks()}"</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
