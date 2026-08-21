import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { Megaphone, AlertCircle, Info } from 'lucide-react';
import './ParentPages.css';

export default function Announcements() {
  const { allAnnouncements } = useAuth();
  // Sort announcements to show urgent/important first, then by date
  const sortedAnnouncements = [...allAnnouncements]
    .filter(ann => ann.createdBy === 'Mrs. Priya')
    .sort((a, b) => {
      const priorityWeight = { urgent: 3, important: 2, general: 1 };
      if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      return parseISO(b.date) - parseISO(a.date);
    });

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Announcements</h1>
        <p>Important updates from the school and teachers.</p>
      </header>

      <div className="announcements-list">
        {sortedAnnouncements.map(ann => (
          <div key={ann.id} className={`card announcement-card priority-${ann.priority}`}>
            <div className="announcement-header">
              <div className="title-group">
                {ann.priority === 'urgent' ? <AlertCircle className="icon-urgent" /> : 
                 ann.priority === 'important' ? <Megaphone className="icon-important" /> : 
                 <Info className="icon-general" />}
                <h2>{ann.title}</h2>
              </div>
              <span className={`badge badge-${ann.priority}`}>
                {ann.priority.charAt(0).toUpperCase() + ann.priority.slice(1)}
              </span>
            </div>
            
            <p className="announcement-desc">{ann.description}</p>
            
            <div className="announcement-footer">
              <span className="author">By {ann.createdBy}</span>
              <span className="date">{format(parseISO(ann.date), 'MMM do, yyyy')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
