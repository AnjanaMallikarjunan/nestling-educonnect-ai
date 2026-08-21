import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, Clock, Lock, User } from 'lucide-react';
import './TeacherPages.css';
import '../parent/ParentPages.css';

export default function TeacherMessages() {
  const { currentUser, allStudents, allUsers, allMessages, sendMessage } = useAuth();
  
  // Find students in this teacher's class
  const classStudents = allStudents.filter(s => s.teacherId === currentUser?.id);
  
  // Find linked parents for these students
  const parentContacts = classStudents.map(student => {
    const parent = allUsers.find(u => u.id === student.parentId && u.role === 'parent');
    return {
      student,
      parent
    };
  }).filter(c => c.parent !== undefined);

  const [activeContact, setActiveContact] = useState(parentContacts[0] || null);
  const [newMessage, setNewMessage] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);

  // Check if current time is between 19:00 (7 PM) and 20:00 (8 PM)
  useEffect(() => {
    const checkAvailability = () => {
      const now = new Date();
      const hours = now.getHours();
      setIsAvailable(hours >= 19 && hours < 20);
    };
    
    checkAvailability();
    const interval = setInterval(checkAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact || !isAvailable) return;
    
    await sendMessage(currentUser.id, activeContact.parent.id, newMessage.trim());
    setNewMessage('');
  };

  const activeMessages = activeContact ? allMessages.filter(msg => 
    (msg.senderId === currentUser.id && msg.receiverId === activeContact.parent.id) ||
    (msg.senderId === activeContact.parent.id && msg.receiverId === currentUser.id)
  ) : [];

  return (
    <div className="page-container chat-container" style={{ maxWidth: '1000px' }}>
      <header className="page-header chat-header">
        <div>
          <h1>Teacher Messaging</h1>
          <p>Communicate directly with student guardians.</p>
        </div>
        
        <div className={`status-badge ${isAvailable ? 'status-open' : 'status-closed'}`}>
          {isAvailable ? (
            <><Clock size={16} /> Messaging is Open</>
          ) : (
            <><Lock size={16} /> Closed (Available 7PM - 8PM)</>
          )}
        </div>
      </header>

      {!isAvailable && (
        <div className="alert-box">
          Communication with parents is only active between 7:00 PM and 8:00 PM.
        </div>
      )}

      <div className="chat-layout">
        {/* Left Side: Parent Tabs */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            Guardians
          </div>
          <div className="chat-contacts-list">
            {parentContacts.map(contact => (
              <div 
                key={`${contact.parent.id}_${contact.student.id}`} 
                className={`chat-contact-item ${activeContact?.parent?.id === contact.parent.id ? 'active' : ''}`}
                onClick={() => setActiveContact(contact)}
              >
                <img 
                  src={contact.parent.profileImage} 
                  alt="" 
                  className="chat-contact-avatar" 
                />
                <div className="chat-contact-info">
                  <span className="chat-contact-name">{contact.parent.name}</span>
                  <span className="chat-contact-subtitle">{contact.student.name}'s Guardian</span>
                </div>
              </div>
            ))}
            {parentContacts.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                No registered parent accounts found.
              </div>
            )}
          </div>
        </aside>

        {/* Right Side: Active Chat Window */}
        <div className="chat-main" style={{ display: 'flex', flexDirection: 'column' }}>
          {activeContact ? (
            <div className="chat-window card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-primary-bg)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>Chat with {activeContact.parent.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Guardian of {activeContact.student.name}</span>
              </div>

              <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
                {activeMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`message-wrapper ${isMe ? 'message-right' : 'message-left'}`}>
                      {!isMe && <img src={activeContact.parent.profileImage} alt="" className="chat-avatar" />}
                      <div className={`message-bubble ${isMe ? 'my-message' : 'their-message'}`}>
                        <p>{msg.text}</p>
                        <span className="timestamp">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
                {activeMessages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '4rem', fontSize: '0.9rem' }}>
                    No messages yet. Send a note to get started!
                  </div>
                )}
              </div>
              
              <form className="chat-input-area" onSubmit={handleSend}>
                <input 
                  type="text" 
                  placeholder={isAvailable ? "Type a message..." : "Messaging is currently locked..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={!isAvailable}
                />
                <button type="submit" className="btn btn-primary send-btn" disabled={!isAvailable || !newMessage.trim()}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Select a parent from the sidebar to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
