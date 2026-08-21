import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Check, X, Calendar, AlertCircle } from 'lucide-react';
import './TeacherPages.css';

export default function TeacherLeaves() {
  const { allLeaveRequests, allStudents, updateLeaveStatus } = useAuth();

  const getStudentName = (studentId) => {
    const student = allStudents.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  const getStudentClass = (studentId) => {
    const student = allStudents.find(s => s.id === studentId);
    return student ? student.class : 'Grade 4 - Section A';
  };

  const getStudentImage = (studentId) => {
    const student = allStudents.find(s => s.id === studentId);
    return student ? student.profileImage : 'https://api.dicebear.com/7.x/notionists/svg?seed=Student';
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1 className="greeting">Student Leave Requests</h1>
          <p className="date">Manage leave applications submitted by parents.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: '1fr' }}>
        {allLeaveRequests.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <Calendar size={48} style={{ margin: '0 auto 1rem auto', display: 'block', opacity: 0.5 }} />
            <p style={{ fontSize: '1.1rem' }}>No leave requests submitted yet.</p>
          </div>
        ) : (
          allLeaveRequests.map((req) => (
            <div key={req.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: req.status === 'pending' ? '4px solid var(--color-urgent)' : req.status === 'approved' ? '4px solid var(--color-success)' : '4px solid var(--color-text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={getStudentImage(req.studentId)} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{getStudentName(req.studentId)}</h3>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>{getStudentClass(req.studentId)}</p>
                  </div>
                </div>

                <span className={`badge badge-${req.status === 'pending' ? 'urgent' : req.status === 'approved' ? 'general' : 'important'}`} style={{ textTransform: 'capitalize' }}>
                  {req.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'rgba(0,0,0,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                  <Calendar size={16} />
                  <span>Duration: {req.startDate} to {req.endDate}</span>
                </div>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.95rem', color: 'var(--color-text)' }}>
                  <strong>Reason:</strong> {req.reason}
                </p>
              </div>

              {req.status === 'pending' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ backgroundColor: 'var(--color-success)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.65rem 1.25rem' }}
                    onClick={() => updateLeaveStatus(req.id, 'approved')}
                  >
                    <Check size={18} /> Approve
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ backgroundColor: 'var(--color-urgent)', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'auto', padding: '0.65rem 1.25rem' }}
                    onClick={() => updateLeaveStatus(req.id, 'rejected')}
                  >
                    <X size={18} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
