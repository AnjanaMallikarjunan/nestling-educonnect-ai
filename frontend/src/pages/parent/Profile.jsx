import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, Shield, Bell, Phone, Mail, User as UserIcon, Heart } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { currentUser, allStudents, allUsers, submitPasswordRequest } = useAuth();
  
  // Find child details
  const child = allStudents.find(s => s.id === currentUser?.childId);
  // Find teacher details
  const teacher = allUsers.find(u => u.id === child?.teacherId);

  const [passwordRequestSent, setPasswordRequestSent] = useState(false);

  // States for Editable Fields
  const [phone, setPhone] = useState('+91 98765 43210');
  const [relationship, setRelationship] = useState('Father');
  const [emergencyName, setEmergencyName] = useState('Karan Sharma');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98765 00000');
  
  // States for Preference Toggles
  const [notifyHomework, setNotifyHomework] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);
  const [notifyAttendance, setNotifyAttendance] = useState(false);
  const [notifyMessages, setNotifyMessages] = useState(true);

  // UI feedback state
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request saving data
    setTimeout(() => {
      setIsSubmitting(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  const handlePasswordRequest = async () => {
    const ok = await submitPasswordRequest(currentUser.id, currentUser.name);
    if (ok) {
      setPasswordRequestSent(true);
      setTimeout(() => setPasswordRequestSent(false), 4000);
    }
  };

  if (!currentUser) return <div className="card">Loading parent profile...</div>;

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings, emergency contacts, and notifications.</p>
      </div>

      {showToast && (
        <div className="toast-success">
          <Check size={20} />
          <span>Profile settings updated successfully!</span>
        </div>
      )}

      {passwordRequestSent && (
        <div className="toast-success" style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)', color: 'var(--color-success)' }}>
          <Check size={20} />
          <span>Password request sent! Your class teacher has been notified.</span>
        </div>
      )}

      <div className="profile-grid">
        {/* Parent Details Card */}
        <section className="card">
          <div className="profile-header-section">
            <div className="profile-avatar-wrapper">
              <img 
                src={currentUser.profileImage} 
                alt={currentUser.name} 
                className="profile-avatar" 
              />
            </div>
            <div className="profile-meta">
              <h2>{currentUser.name}</h2>
              <p className="badge btn-secondary">Parent Account</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <h3 className="settings-section-title">Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="parent-name">Full Name</label>
                <div className="form-control" style={{ backgroundColor: 'var(--color-border)', cursor: 'not-allowed' }}>
                  {currentUser.name}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="parent-email">Email Address</label>
                <div className="form-control" style={{ backgroundColor: 'var(--color-border)', cursor: 'not-allowed' }}>
                  {currentUser.email}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="parent-phone">Phone Number</label>
                <input 
                  id="parent-phone"
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="parent-relationship">Relationship to Student</label>
                <input 
                  id="parent-relationship"
                  type="text" 
                  value={relationship} 
                  onChange={(e) => setRelationship(e.target.value)} 
                  className="form-control"
                  required
                />
              </div>
            </div>

            <h3 className="settings-section-title">Emergency Contact Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emergency-name">Emergency Contact Name</label>
                <input 
                  id="emergency-name"
                  type="text" 
                  value={emergencyName} 
                  onChange={(e) => setEmergencyName(e.target.value)} 
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergency-phone">Emergency Contact Phone</label>
                <input 
                  id="emergency-phone"
                  type="tel" 
                  value={emergencyPhone} 
                  onChange={(e) => setEmergencyPhone(e.target.value)} 
                  className="form-control"
                  required
                />
              </div>
            </div>

            <h3 className="settings-section-title">Notification Preferences</h3>
            
            <div className="preference-item">
              <div className="preference-info">
                <h4>Homework Alerts</h4>
                <p>Get notified when new homework is assigned or overdue.</p>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notifyHomework} 
                  onChange={(e) => setNotifyHomework(e.target.checked)} 
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>School Announcements</h4>
                <p>Get notified about urgent notices and general announcements.</p>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notifyAnnouncements} 
                  onChange={(e) => setNotifyAnnouncements(e.target.checked)} 
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Daily Attendance Alerts</h4>
                <p>Receive check-in/out alerts and notifications for absences.</p>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notifyAttendance} 
                  onChange={(e) => setNotifyAttendance(e.target.checked)} 
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h4>Direct Messages</h4>
                <p>Get instant updates when a teacher sends you a message.</p>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notifyMessages} 
                  onChange={(e) => setNotifyMessages(e.target.checked)} 
                />
                <span className="slider"></span>
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '2rem', width: '100%' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Student and School Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {child && (
            <section className="card">
              <div className="child-card-header">
                <img 
                  src={child.profileImage} 
                  alt={child.name} 
                  className="child-profile-image" 
                />
                <div className="child-card-name">
                  <h3>{child.name}</h3>
                  <p>Student Profile</p>
                </div>
              </div>

              <div className="child-details-list">
                <div className="child-detail-row">
                  <span className="child-detail-label">Grade / Class</span>
                  <span className="child-detail-value">{child.class}</span>
                </div>
                <div className="child-detail-row">
                  <span className="child-detail-label">Student ID</span>
                  <span className="child-detail-value">{child.id}</span>
                </div>
                <div className="child-detail-row">
                  <span className="child-detail-label">Roll Number</span>
                  <span className="child-detail-value">#{child.rollNumber || '-'}</span>
                </div>
                <div className="child-detail-row">
                  <span className="child-detail-label">School Name</span>
                  <span className="child-detail-value">Greenwood Academy</span>
                </div>
              </div>

              {teacher && (
                <div className="teacher-contact-card">
                  <div className="teacher-contact-title">Class Teacher Information</div>
                  <div className="teacher-contact-info">
                    <strong>{teacher.name}</strong>
                    <span>{teacher.class}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <Mail size={14} /> {teacher.email}
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Security & Quick Help Card */}
          <section className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--color-primary)" />
              Security & Info
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Your account details are protected using industry-standard encryption. Contact the administration desk if you need to modify primary details like child association or legal names.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '0.9rem' }}
                onClick={handlePasswordRequest}
              >
                Request to Change Password
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.9rem', color: 'var(--color-urgent)', backgroundColor: 'var(--color-urgent-bg)' }}>
                Request Account Deletion
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
