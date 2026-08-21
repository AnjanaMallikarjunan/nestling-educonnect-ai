import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, Clock, Lock } from 'lucide-react';
import './ParentPages.css';

export default function Messages() {
  const { currentUser, allStudents, allUsers, allMessages, sendMessage } = useAuth();
  const child = allStudents.find(s => s.id === currentUser?.childId);
  
  // Find class teacher and other subject teachers
  const allTeachers = allUsers.filter(u => u.role === 'teacher');
  const classTeacher = allTeachers.find(t => t.id === child?.teacherId);
  
  const [activeTeacher, setActiveTeacher] = useState(classTeacher || allTeachers[0] || null);
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
    if (!newMessage.trim() || !activeTeacher || !isAvailable) return;
    
    await sendMessage(currentUser.id, activeTeacher.id, newMessage.trim());
    setNewMessage('');
  };

  const activeMessages = activeTeacher ? allMessages.filter(msg => 
    (msg.senderId === currentUser.id && msg.receiverId === activeTeacher.id) ||
    (msg.senderId === activeTeacher.id && msg.receiverId === currentUser.id)
  ) : [];

  return (
    <div className="page-container chat-container" style={{ maxWidth: '1000px' }}>
      <header className="page-header chat-header">
        <div>
          <h1>Classroom Messages</h1>
          <p>Communicate with {child?.name}'s teachers.</p>
        </div>
        
        <div className={`status-badge ${isAvailable ? 'status-open' : 'status-closed'}`}>
          {isAvailable ? (
            <><Clock size={16} /> Teachers are available</>
          ) : (
            <><Lock size={16} /> Messaging is closed (Available 7PM - 8PM)</>
          )}
        </div>
      </header>

      {!isAvailable && (
        <div className="alert-box">
          Teacher communication is only available from 7:00 PM to 8:00 PM.
        </div>
      )}

      <div className="chat-layout">
        {/* Left Side: Teachers Tab Panel */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            Faculty Directory
          </div>
          <div className="chat-contacts-list">
            {allTeachers.map(teacher => {
              const isClassTeacher = teacher.id === child?.teacherId;
              return (
                <div 
                  key={teacher.id} 
                  className={`chat-contact-item ${activeTeacher?.id === teacher.id ? 'active' : ''}`}
                  onClick={() => setActiveTeacher(teacher)}
                >
                  <img 
                    src={teacher.profileImage} 
                    alt="" 
                    className="chat-contact-avatar" 
                  />
                  <div className="chat-contact-info">
                    <span className="chat-contact-name">{teacher.name}</span>
                    <span className="chat-contact-subtitle">
                      {isClassTeacher ? 'Class Teacher' : `${teacher.class || 'Subject'} Teacher`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Side: Active Chat Window */}
        <div className="chat-main" style={{ display: 'flex', flexDirection: 'column' }}>
          {activeTeacher ? (
            <div className="chat-window card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-primary-bg)', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>Chat with {activeTeacher.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  {activeTeacher.id === child?.teacherId ? 'Class Teacher' : `${activeTeacher.class} Teacher`}
                </span>
              </div>

              <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
                {activeMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  return (
                    <div key={msg.id} className={`message-wrapper ${isMe ? 'message-right' : 'message-left'}`}>
                      {!isMe && <img src={activeTeacher.profileImage} alt="" className="chat-avatar" />}
                      <div className={`message-bubble ${isMe ? 'my-message' : 'their-message'}`}>
                        <p>{msg.text}</p>
                        <span className="timestamp">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
                {activeMessages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '4rem', fontSize: '0.9rem' }}>
                    No messages yet. Send a note to start the conversation.
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
                <p>Select a teacher to start messaging.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
