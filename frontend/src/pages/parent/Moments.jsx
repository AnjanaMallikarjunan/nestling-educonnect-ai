import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { Camera } from 'lucide-react';
import './ParentPages.css';

export default function Moments() {
  const { currentUser, allStudents, allPhotos } = useAuth();
  const child = allStudents.find(s => s.id === currentUser?.childId);
  
  // Filter photos where the child is tagged, or general photos with no tags
  const childPhotos = allPhotos
    .filter(p => !p.studentIds || p.studentIds.length === 0 || p.studentIds.includes(child?.id))
    .sort((a, b) => parseISO(b.date) - parseISO(a.date));

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Today's Moments</h1>
        <p>Glimpses from {child?.name}'s classroom activities.</p>
      </header>

      <div className="photo-grid">
        {childPhotos.map(photo => (
          <div key={photo.id} className="card photo-card">
            <img src={photo.imageUrl} alt={photo.activityTitle} className="photo-image" />
            <div className="photo-content">
              <div className="photo-header">
                <h3><Camera size={18} /> {photo.activityTitle}</h3>
                <span className="photo-date">{format(parseISO(photo.date), 'MMM do')}</span>
              </div>
              <p>{photo.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
