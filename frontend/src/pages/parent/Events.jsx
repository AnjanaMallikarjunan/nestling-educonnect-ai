import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import './ParentPages.css';

export default function Events() {
  const { allEvents } = useAuth();
  const upcomingEvents = [...allEvents].sort((a, b) => parseISO(a.date) - parseISO(b.date));

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Events</h1>
        <p>Upcoming school and classroom events.</p>
      </header>

      <div className="events-grid">
        {upcomingEvents.map(event => (
          <div key={event.id} className="card event-card-large">
            <div className="event-date-block">
              <span className="event-month">{format(parseISO(event.date), 'MMM')}</span>
              <span className="event-day">{format(parseISO(event.date), 'dd')}</span>
            </div>
            
            <div className="event-details-large">
              <h2>{event.title}</h2>
              <p className="event-desc">{event.description}</p>
              
              <div className="event-meta">
                <span><Clock size={16} /> {event.time}</span>
                <span><MapPin size={16} /> {event.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
