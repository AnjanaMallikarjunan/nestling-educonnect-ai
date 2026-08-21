import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Check, AlertCircle, Link2, Users, GraduationCap, Edit, Trash2, X } from 'lucide-react';
import './TeacherPages.css';

export default function CreateParent() {
  const { allStudents, allUsers, registerParent, createStudent, updateParent, deleteParent } = useAuth();
  
  // Parent Form States
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Student Form States
  const [studentName, setStudentName] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentClass, setStudentClass] = useState('Grade 4 - Section A');
  const [studentSuccessMsg, setStudentSuccessMsg] = useState('');
  const [studentErrorMsg, setStudentErrorMsg] = useState('');
  const [studentLoading, setStudentLoading] = useState(false);

  // Edit Parent Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingParentId, setEditingParentId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editSelectedStudent, setEditSelectedStudent] = useState('');

  // Get only parents from allUsers
  const registeredParents = allUsers.filter(user => user.role === 'parent');

  const handleParentSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    
    if (!selectedStudent) {
      setErrorMsg('Please select a student to link this parent account with.');
      return;
    }

    if (!parentPassword.trim()) {
      setErrorMsg('Please set a password for the parent account.');
      return;
    }

    // Check if email already exists
    const emailExists = allUsers.some(
      user => user.email.toLowerCase() === parentEmail.trim().toLowerCase()
    );
    if (emailExists) {
      setErrorMsg('A user account with this email address already exists.');
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      try {
        const studentObj = allStudents.find(s => s.id === selectedStudent);
        const newParent = await registerParent(
          parentName.trim(),
          parentEmail.trim().toLowerCase(),
          parentPassword.trim(),
          selectedStudent
        );
        
        if (newParent) {
          setSuccessMsg(`Parent account for "${newParent.name}" created successfully and linked to ${studentObj?.name}!`);
          // Reset form
          setParentName('');
          setParentEmail('');
          setParentPassword('');
          setSelectedStudent('');
        } else {
          setErrorMsg('Failed to create parent account. Please try again.');
        }
      } catch (err) {
        setErrorMsg('Failed to create account. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    setStudentSuccessMsg('');
    setStudentErrorMsg('');

    if (!studentName.trim() || !studentRoll.trim()) {
      setStudentErrorMsg('Please fill in all fields.');
      return;
    }

    // Check if roll number already exists
    const rollExists = allStudents.some(
      s => s.rollNumber === parseInt(studentRoll.trim())
    );
    if (rollExists) {
      setStudentErrorMsg(`Roll number ${studentRoll.trim()} is already assigned to another student.`);
      return;
    }

    setStudentLoading(true);

    setTimeout(async () => {
      try {
        const newStudent = await createStudent(
          studentName.trim(),
          studentClass,
          studentRoll.trim()
        );

        if (newStudent) {
          setStudentSuccessMsg(`Student "${newStudent.name}" with Roll Number ${newStudent.rollNumber} created successfully!`);
          // Reset form
          setStudentName('');
          setStudentRoll('');
        } else {
          setStudentErrorMsg('Failed to register student. Please try again.');
        }
      } catch (err) {
        setStudentErrorMsg('Failed to register student. Please try again.');
      } finally {
        setStudentLoading(false);
      }
    }, 600);
  };

  const handleOpenEdit = (parent) => {
    setEditingParentId(parent.id);
    setEditName(parent.name);
    setEditEmail(parent.email);
    setEditPassword(parent.password || 'password');
    setEditSelectedStudent(parent.childId || '');
    setSuccessMsg('');
    setErrorMsg('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updated = await updateParent(editingParentId, {
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      password: editPassword.trim(),
      childId: editSelectedStudent
    });
    if (updated) {
      setSuccessMsg('✓ Parent information updated successfully!');
      setShowEditModal(false);
    } else {
      setErrorMsg('Failed to update parent details.');
    }
  };

  const handleDelete = async (id, name) => {
    setSuccessMsg('');
    setErrorMsg('');
    if (window.confirm(`Are you sure you want to delete parent account "${name}"?`)) {
      const ok = await deleteParent(id);
      if (ok) {
        setSuccessMsg('Parent account deleted successfully.');
      } else {
        setErrorMsg('Failed to delete parent account.');
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="page-header flex-header">
        <div>
          <h1 className="greeting">Create & Manage Profiles</h1>
          <p className="date">Register, edit, and delete parent and student user details.</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: 'var(--color-urgent-bg)', border: '1px solid var(--color-urgent)', color: 'var(--color-urgent)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Parent Registration Form Card */}
        <section className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <UserPlus size={22} /> Parent Registration Form
          </h2>
          
          <form onSubmit={handleParentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="parent-name" style={{ fontWeight: '500', fontSize: '0.9rem' }}>Parent's Full Name</label>
              <input 
                id="parent-name"
                type="text" 
                className="form-control" 
                placeholder="e.g. Amit Patel"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="parent-email" style={{ fontWeight: '500', fontSize: '0.9rem' }}>Parent's Email Address</label>
              <input 
                id="parent-email"
                type="email" 
                className="form-control" 
                placeholder="e.g. amit@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="parent-password" style={{ fontWeight: '500', fontSize: '0.9rem' }}>Account Password</label>
              <input 
                id="parent-password"
                type="text" 
                className="form-control" 
                placeholder="e.g. secret123"
                value={parentPassword}
                onChange={(e) => setParentPassword(e.target.value)}
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="student-select" style={{ fontWeight: '500', fontSize: '0.9rem' }}>Link to Student</label>
              <select 
                id="student-select"
                className="form-control"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                required
              >
                <option value="">-- Choose a Student --</option>
                {allStudents.map(student => {
                  const existingParent = registeredParents.find(p => p.childId === student.id);
                  return (
                    <option key={student.id} value={student.id}>
                      {student.name} (Roll: {student.rollNumber || 'N/A'}) {existingParent ? `[Already linked]` : '[Unlinked]'}
                    </option>
                  );
                })}
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register Parent Account'}
            </button>
          </form>
        </section>

        {/* Student Registration Form Card */}
        <section className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
            <GraduationCap size={22} /> Student Registration Form
          </h2>
          
          {studentSuccessMsg && (
            <div style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <Check size={18} />
              <span>{studentSuccessMsg}</span>
            </div>
          )}

          {studentErrorMsg && (
            <div style={{ backgroundColor: 'var(--color-urgent-bg)', border: '1px solid var(--color-urgent)', color: 'var(--color-urgent)', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <AlertCircle size={18} />
              <span>{studentErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="student-name" style={{ fontWeight: '500', fontSize: '0.9rem' }}>Student's Full Name</label>
              <input 
                id="student-name"
                type="text" 
                className="form-control" 
                placeholder="e.g. Rohan Verma"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="student-roll" style={{ fontWeight: '500', fontSize: '0.9rem' }}>Roll Number</label>
              <input 
                id="student-roll"
                type="number" 
                className="form-control" 
                placeholder="e.g. 109"
                value={studentRoll}
                onChange={(e) => setStudentRoll(e.target.value)}
                required 
              />
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="student-class" style={{ fontWeight: '500', fontSize: '0.9rem' }}>Class / Section</label>
              <select 
                id="student-class"
                className="form-control"
                value={studentClass}
                onChange={(e) => setStudentClass(e.target.value)}
                required
              >
                <option value="Grade 4 - Section A">Grade 4 - Section A</option>
                <option value="Grade 4 - Section B">Grade 4 - Section B</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
              disabled={studentLoading}
            >
              {studentLoading ? 'Registering Student...' : 'Register Student Profile'}
            </button>
          </form>
        </section>
      </div>

      {/* Directory of Linked Parents */}
      <section className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)' }}>
          <Users size={22} /> Parent-Student Directory
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Manage all parent user accounts registered in Nestling, edit their records, or delete inactive profiles.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Parent Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Parent ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Parent Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Password</th>
                <th style={{ padding: '0.75rem 1rem' }}>Associated Student</th>
                <th style={{ padding: '0.75rem 1rem' }}>Student ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Roll Number</th>
                <th style={{ padding: '0.75rem 1rem' }}>Class</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registeredParents.map(parent => {
                const student = allStudents.find(s => s.id === parent.childId);
                return (
                  <tr key={parent.id} style={{ borderBottom: '1px solid var(--color-border)', height: '56px' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={parent.profileImage} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                        {parent.name}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{parent.id}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>{parent.email}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontWeight: '600' }}>
                      {parent.password || 'password'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>
                      {student ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Link2 size={16} color="var(--color-primary)" />
                          {student.name}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-urgent)' }}>No child linked</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{student ? student.id : '-'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontWeight: '600' }}>
                      {student ? student.rollNumber || '-' : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-muted)' }}>
                      {student ? student.class : '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <button 
                          className="action-icon-btn edit" 
                          onClick={() => handleOpenEdit(parent)}
                          title="Edit Parent Details"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-icon-btn delete" 
                          onClick={() => handleDelete(parent.id, parent.name)}
                          title="Delete Parent Account"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit Parent Overlay Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Edit Parent Details</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Password</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontWeight: '500', fontSize: '0.9rem' }}>Linked Student</label>
                <select 
                  className="form-control"
                  value={editSelectedStudent}
                  onChange={(e) => setEditSelectedStudent(e.target.value)}
                  required
                >
                  <option value="">-- Choose a Student --</option>
                  {allStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} (Roll: {student.rollNumber || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
