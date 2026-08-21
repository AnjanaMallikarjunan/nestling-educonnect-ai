import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO, isPast } from 'date-fns';
import { CheckCircle, Clock } from 'lucide-react';
import './ParentPages.css';

export default function Homework() {
  const { currentUser, allStudents, allHomework, updateHomework } = useAuth();
  const child = allStudents.find(s => s.id === currentUser?.childId);
  
  // Filter homework for the teacher of this child (or general homework list)
  const childHomework = allHomework.filter(hw => hw.teacherId === child?.teacherId);

  const toggleStatus = (hw) => {
    const nextStatus = hw.status === 'completed' ? 'pending' : 'completed';
    updateHomework(hw.id, { status: nextStatus });
  };

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

  const safeIsPast = (dateStr) => {
    try {
      if (!dateStr) return false;
      const parsed = parseISO(dateStr);
      if (isNaN(parsed.getTime())) return false;
      return isPast(parsed);
    } catch (e) {
      return false;
    }
  };

  const pendingHomework = childHomework.filter(hw => hw.status === 'pending');
  const completedHomework = childHomework.filter(hw => hw.status === 'completed');

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{child?.name}'s Homework</h1>
        <p>Track assignments and mark them as completed.</p>
      </header>

      <section className="hw-section">
        <h2>Pending Tasks ({pendingHomework.length})</h2>
        <div className="hw-grid">
          {pendingHomework.map(hw => (
            <div key={hw.id} className="card hw-card">
              <div className="hw-header">
                <span className="subject-badge">{hw.subject}</span>
                <span className={`due-date ${safeIsPast(hw.dueDate) ? 'overdue' : ''}`}>
                  <Clock size={16} /> Due {safeFormatDate(hw.dueDate)}
                </span>
              </div>
              
              <h3>{hw.title}</h3>
              <p>{hw.description}</p>
              
              <button 
                className="btn btn-primary mark-done-btn"
                onClick={() => toggleStatus(hw)}
              >
                <CheckCircle size={18} /> Mark as Completed
              </button>
            </div>
          ))}
          {pendingHomework.length === 0 && <p className="empty-text">No pending homework. Great job!</p>}
        </div>
      </section>

      <section className="hw-section">
        <h2>Completed</h2>
        <div className="hw-grid">
          {completedHomework.map(hw => (
            <div key={hw.id} className="card hw-card completed">
              <div className="hw-header">
                <span className="subject-badge">{hw.subject}</span>
                <span className="due-date completed-text">
                  <CheckCircle size={16} /> Completed
                </span>
              </div>
              
              <h3 className="completed-title">{hw.title}</h3>
              <p>{hw.description}</p>
              
              <button 
                className="btn btn-secondary mark-done-btn"
                onClick={() => toggleStatus(hw)}
              >
                Mark as Pending
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
