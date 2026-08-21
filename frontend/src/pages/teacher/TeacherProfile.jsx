import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, Shield, Mail, User as UserIcon, BookOpen, GraduationCap } from 'lucide-react';
import '../parent/Profile.css'; // Reuse profile layout and card styles

export default function TeacherProfile() {
  const { currentUser, allStudents } = useAuth();
  
  // Find students in teacher's class
  const classStudents = allStudents.filter(s => s.teacherId === currentUser?.id);

  // States for Editable Fields (Simulated for demo)
  const [phone, setPhone] = useState('+91 98765 12345');
  const [officeHours, setOfficeHours] = useState('02:00 PM - 04:00 PM');
  
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

  if (!currentUser) return <div className="card">Loading teacher profile...</div>;

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings, office hours, and view your class roster.</p>
      </div>

      {showToast && (
        <div className="toast-success">
          <Check size={20} />
          <span>Profile settings updated successfully!</span>
        </div>
      )}

      <div className="profile-grid">
        {/* Teacher Details Card */}
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
              <p className="badge btn-secondary">Teacher Account</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <h3 className="settings-section-title">Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teacher-name">Full Name</label>
                <div className="form-control" style={{ backgroundColor: 'var(--color-border)', cursor: 'not-allowed' }}>
                  {currentUser.name}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="teacher-email">Email Address</label>
                <div className="form-control" style={{ backgroundColor: 'var(--color-border)', cursor: 'not-allowed' }}>
                  {currentUser.email}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="teacher-phone">Phone Number</label>
                <input 
                  id="teacher-phone"
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="teacher-office">Office Hours</label>
                <input 
                  id="teacher-office"
                  type="text" 
                  value={officeHours} 
                  onChange={(e) => setOfficeHours(e.target.value)} 
                  className="form-control"
                  required
                />
              </div>
            </div>

            <h3 className="settings-section-title">Classroom Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Assigned Class</label>
                <div className="form-control" style={{ backgroundColor: 'var(--color-border)', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={16} /> {currentUser.class || 'N/A'}
                </div>
              </div>

              <div className="form-group">
                <label>Total Students</label>
                <div className="form-control" style={{ backgroundColor: 'var(--color-border)', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserIcon size={16} /> {classStudents.length} Students
                </div>
              </div>
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

        {/* Students list and Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Class Students Card */}
          <section className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
              <BookOpen size={20} />
              Class Students ({currentUser.class || 'My Class'})
            </h3>
            
            {classStudents.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No students enrolled in your class.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {classStudents.map(student => (
                  <div key={student.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={student.profileImage} 
                        alt={student.name} 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-bg)' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>{student.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ID: {student.id}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Security & Info Card */}
          <section className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--color-primary)" />
              Security & Info
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Your teacher credentials and authorization scopes are protected. Please contact the IT support or administrator if you need to update class assignments or privileges.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', fontSize: '0.9rem' }}
                onClick={() => alert("Please contact school administration at admin@nestling.edu to request detail or credentials changes.")}
              >
                Request to Change Class / Password
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
