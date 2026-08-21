import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { Star, Award, MessageCircle } from 'lucide-react';
import './ParentPages.css';

export default function DailyProgress() {
  const { currentUser, allStudents, allDailyProgress } = useAuth();
  const child = allStudents.find(s => s.id === currentUser?.childId);
  
  const childProgress = allDailyProgress
    .filter(p => p.studentId === child?.id)
    .sort((a, b) => parseISO(b.date) - parseISO(a.date));

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{child?.name}'s Progress</h1>
        <p>Daily observations and academic performance.</p>
      </header>

      <div className="progress-history">
        {childProgress.map(prog => (
          <div key={prog.id} className="card progress-card">
            <div className="progress-header">
              <h2>{format(parseISO(prog.date), 'EEEE, MMMM do')}</h2>
              <span className={`badge ${prog.attendance === 'Present' ? 'badge-general' : 'badge-urgent'}`}>
                {prog.attendance}
              </span>
            </div>

            <div className="ratings-grid">
              <div className="rating-item">
                <span className="rating-label"><Award size={18} /> Academic</span>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill={i < prog.academicRating ? 'var(--color-primary)' : 'none'} color={i < prog.academicRating ? 'var(--color-primary)' : 'var(--color-border)'} />
                  ))}
                </div>
              </div>

              <div className="rating-item">
                <span className="rating-label"><Award size={18} /> Participation</span>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill={i < prog.participationRating ? 'var(--color-primary)' : 'none'} color={i < prog.participationRating ? 'var(--color-primary)' : 'var(--color-border)'} />
                  ))}
                </div>
              </div>

              <div className="rating-item">
                <span className="rating-label"><Award size={18} /> Behaviour</span>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill={i < prog.behaviourRating ? 'var(--color-primary)' : 'none'} color={i < prog.behaviourRating ? 'var(--color-primary)' : 'var(--color-border)'} />
                  ))}
                </div>
              </div>
            </div>

            <div className="teacher-note-full">
              <div className="note-header">
                <MessageCircle size={18} />
                <strong>Teacher's Note</strong>
              </div>
              <p>"{prog.teacherNote}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
