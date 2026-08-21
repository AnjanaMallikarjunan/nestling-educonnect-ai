import React, { useState, useEffect } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './WeeklySummary.css';

export default function WeeklySummary({ studentName, studentId }) {
  const { allDailyProgress, allHomework } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [studentId]);

  // Filter progress entries for this specific student
  const studentProgress = allDailyProgress.filter(p => p.studentId === studentId);

  // Helper function to map numeric rating to string
  const getRatingLabel = (avg) => {
    if (!avg || isNaN(avg)) return 'N/A';
    if (avg >= 4.5) return 'Outstanding';
    if (avg >= 4.0) return 'Excellent';
    if (avg >= 3.0) return 'Good';
    if (avg >= 2.0) return 'Satisfactory';
    return 'Needs Improvement';
  };

  // Calculate metrics
  let avgAcademic = 0;
  let avgParticipation = 0;
  let avgBehaviour = 0;
  let attendanceRate = 100;
  let teacherNote = 'No comments logged by the teacher this week.';
  const highlights = [];

  if (studentProgress.length > 0) {
    const total = studentProgress.length;
    const sumAcademic = studentProgress.reduce((sum, p) => sum + (p.academicRating || 0), 0);
    const sumParticipation = studentProgress.reduce((sum, p) => sum + (p.participationRating || 0), 0);
    const sumBehaviour = studentProgress.reduce((sum, p) => sum + (p.behaviourRating || 0), 0);
    const presentDays = studentProgress.filter(p => p.attendance === 'P' || p.attendance === 'Present').length;

    avgAcademic = sumAcademic / total;
    avgParticipation = sumParticipation / total;
    avgBehaviour = sumBehaviour / total;
    attendanceRate = Math.round((presentDays / total) * 100);

    // Get latest teacher note
    const notes = studentProgress.filter(p => p.teacherNote && p.teacherNote.trim() !== '');
    if (notes.length > 0) {
      teacherNote = `"${notes[notes.length - 1].teacherNote}"`;
    }

    // Dynamic highlights
    if (avgAcademic >= 4.0) {
      highlights.push(`Showed exceptional academic focus this week.`);
    } else if (avgAcademic < 3.0) {
      highlights.push(`Needs slight support with classroom learning concepts.`);
    }

    if (avgParticipation >= 4.0) {
      highlights.push(`Consistently active and engaging in classroom discussions.`);
    } else if (avgParticipation < 3.0) {
      highlights.push(`Needs encouragement to participate more in discussions.`);
    }

    if (avgBehaviour >= 4.0) {
      highlights.push(`Demonstrated exemplary classroom conduct and respect.`);
    } else if (avgBehaviour < 3.0) {
      highlights.push(`Requires guidance to stay focused and avoid distractions.`);
    }

    if (attendanceRate === 100) {
      highlights.push(`Perfect school attendance recorded this week.`);
    } else {
      highlights.push(`Maintained an attendance rate of ${attendanceRate}%.`);
    }
  } else {
    highlights.push('Waiting for weekly daily logs to analyze highlights.');
    highlights.push('No learning observations registered yet.');
  }

  // Count pending homework for this child
  const pendingHw = allHomework.filter(hw => hw.status === 'assigned' || hw.status === 'Pending').length;

  if (isLoading) {
    return (
      <div className="ai-summary-card card loading-skeleton-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <div className="skeleton-pulse" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--color-border)' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton-pulse" style={{ height: '1.1rem', width: '30%', background: 'var(--color-border)', borderRadius: '4px' }} />
            <div className="skeleton-pulse" style={{ height: '0.8rem', width: '60%', background: 'var(--color-border)', borderRadius: '4px' }} />
          </div>
        </div>
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div className="skeleton-pulse" style={{ height: '0.85rem', width: '95%', background: 'var(--color-border)', borderRadius: '4px' }} />
          <div className="skeleton-pulse" style={{ height: '0.85rem', width: '85%', background: 'var(--color-border)', borderRadius: '4px' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="ai-summary-card card">
      <div className="ai-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ai-title-group">
          <div className="ai-icon-container">
            <Sparkles size={20} className="ai-icon" />
          </div>
          <div>
            <h2 className="ai-title">AI Weekly Summary</h2>
            <p className="ai-subtitle">Generated based on this week's teacher updates for {studentName}</p>
          </div>
        </div>
        <button className="expand-btn">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isExpanded && (
        <div className="ai-content">
          <div className="ai-disclaimer">
            This is an automated summary of teacher-provided data.
          </div>
          
          <div className="ai-stats-grid">
            <div className="ai-stat-item"><span>📚 Academic</span> <strong>{getRatingLabel(avgAcademic)}</strong></div>
            <div className="ai-stat-item"><span>⭐ Participation</span> <strong>{getRatingLabel(avgParticipation)}</strong></div>
            <div className="ai-stat-item"><span>😊 Behaviour</span> <strong>{getRatingLabel(avgBehaviour)}</strong></div>
            <div className="ai-stat-item"><span>🏫 Attendance</span> <strong>{attendanceRate}%</strong></div>
            <div className="ai-stat-item"><span>📝 Pending HW</span> <strong>{pendingHw} {pendingHw === 1 ? 'Task' : 'Tasks'}</strong></div>
          </div>

          <div className="ai-highlights">
            <h3>Highlights</h3>
            <ul>
              {highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>

          <div className="ai-teacher-note">
            <h3>Latest Teacher's Note</h3>
            <p>{teacherNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
