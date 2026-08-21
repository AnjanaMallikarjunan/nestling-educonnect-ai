import React, { createContext, useContext, useState, useEffect } from 'react';


const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Lists updated from backend server
  const [allUsers, setAllUsers] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allAnnouncements, setAllAnnouncements] = useState([]);
  const [allHomework, setAllHomework] = useState([]);
  const [allDailyProgress, setAllDailyProgress] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allLeaveRequests, setAllLeaveRequests] = useState([]);
  const [allPasswordRequests, setAllPasswordRequests] = useState([]);
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, studentsRes, annRes, hwRes, progRes, photosRes, eventsRes, leaveRes, passRes, messagesRes] = await Promise.all([
          fetch('http://localhost:3001/api/users').then(r => r.json()).catch(err => { console.error(err); return []; }),
          fetch('http://localhost:3001/api/students').then(r => r.json()).catch(err => { console.error(err); return []; }),
          fetch('http://localhost:3001/api/announcements').then(r => r.json()).catch(err => { console.error(err); return []; }),
          fetch('http://localhost:3001/api/homework').then(r => r.json()).catch(err => { console.error(err); return []; }),
          fetch('http://localhost:3001/api/daily-progress').then(r => r.json()).catch(err => { console.error(err); return []; }),
          fetch('http://localhost:3001/api/photos').then(r => r.json()).catch(err => { console.error(err); return []; }),
          fetch('http://localhost:3001/api/events').then(r => r.json()).catch(err => { console.error(err); return []; }),
          fetch('http://localhost:3001/api/leave').then(r => r.json()).catch(err => { console.error(err); return []; }),
          fetch('http://localhost:3001/api/password-request').then(r => r.json()).catch(err => { console.error(err); return []; }),
          fetch('http://localhost:3001/api/messages').then(r => r.json()).catch(err => { console.error(err); return []; })
        ]);
        setAllUsers(usersRes);
        setAllStudents(studentsRes);
        setAllAnnouncements(annRes);
        setAllHomework(hwRes);
        setAllDailyProgress(progRes);
        setAllPhotos(photosRes);
        setAllEvents(eventsRes);
        setAllLeaveRequests(leaveRes);
        setAllPasswordRequests(passRes);
        setAllMessages(messagesRes);
      } catch (err) {
        console.error("Backend fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    try {
      const savedUser = localStorage.getItem('nestling_user');
      if (savedUser && savedUser !== 'undefined') {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Error parsing current user:", e);
    }

    fetchData();
  }, []);

  const loginByEmail = async (email, password, role) => {
    try {
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user.role === role) {
          setCurrentUser(data.user);
          localStorage.setItem('nestling_user', JSON.stringify(data.user));
          return true;
        }
      }
    } catch (err) {
      console.error("Login request failed:", err);
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nestling_user');
  };

  const registerParent = async (name, email, password, childId) => {
    try {
      const res = await fetch('http://localhost:3001/api/register-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, childId, inviteCode: 'NEST2026' })
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(prev => [...prev, data.user]);
        const studentsRes = await fetch('http://localhost:3001/api/students').then(r => r.json());
        setAllStudents(studentsRes);
        return data.user;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const registerTeacher = async (name, email, password, assignedClass) => {
    try {
      const res = await fetch('http://localhost:3001/api/register-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, inviteCode: 'TEACH2026' })
      });
      if (res.ok) {
        const data = await res.json();
        return data.user;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const addAnnouncement = async (title, description, priority) => {
    try {
      const res = await fetch('http://localhost:3001/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority, createdBy: currentUser?.name || 'Teacher' })
      });
      if (res.ok) {
        const newAnn = await res.json();
        setAllAnnouncements(prev => [newAnn, ...prev]);
        return newAnn;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const addHomework = async (subject, title, description, dueDate) => {
    try {
      const res = await fetch('http://localhost:3001/api/homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subject, 
          title, 
          description, 
          dueDate: new Date(dueDate).toISOString(), 
          teacherId: currentUser?.id || 'user_teacher_1' 
        })
      });
      if (res.ok) {
        const newHw = await res.json();
        setAllHomework(prev => [newHw, ...prev]);
        return newHw;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const updateDailyProgress = async (studentId, attendance, academicRating, behaviourRating, participationRating, teacherNote) => {
    try {
      const res = await fetch('http://localhost:3001/api/daily-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          attendance,
          academicRating: parseInt(academicRating),
          behaviourRating: parseInt(behaviourRating),
          participationRating: parseInt(participationRating),
          teacherNote
        })
      });
      if (res.ok) {
        const progRes = await fetch('http://localhost:3001/api/daily-progress').then(r => r.json());
        setAllDailyProgress(progRes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitLeaveRequest = async (studentId, startDate, endDate, reason) => {
    try {
      const res = await fetch('http://localhost:3001/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, startDate, endDate, reason })
      });
      if (res.ok) {
        const leaves = await fetch('http://localhost:3001/api/leave').then(r => r.json());
        setAllLeaveRequests(leaves);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateLeaveStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:3001/api/leave/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setAllLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createStudent = async (name, className, rollNumber) => {
    try {
      const res = await fetch('http://localhost:3001/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, className, rollNumber })
      });
      if (res.ok) {
        const newStudent = await res.json();
        setAllStudents(prev => [...prev, newStudent]);
        return newStudent;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const updateParent = async (id, fields) => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        const updated = await res.json();
        setAllUsers(prev => prev.map(u => u.id === id ? updated : u));
        
        // Synchronize students state
        const studentsRes = await fetch('http://localhost:3001/api/students').then(r => r.json());
        setAllStudents(studentsRes);
        
        return updated;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const deleteParent = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAllUsers(prev => prev.filter(u => u.id !== id));
        
        // Synchronize students state
        const studentsRes = await fetch('http://localhost:3001/api/students').then(r => r.json());
        setAllStudents(studentsRes);
        
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const submitPasswordRequest = async (parentId, parentName) => {
    try {
      const res = await fetch('http://localhost:3001/api/password-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, parentName })
      });
      if (res.ok) {
        const reqs = await fetch('http://localhost:3001/api/password-request').then(r => r.json());
        setAllPasswordRequests(reqs);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const addPhoto = async (imageUrl, activityTitle, description) => {
    try {
      const res = await fetch('http://localhost:3001/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, activityTitle, description })
      });
      if (res.ok) {
        const newPhoto = await res.json();
        setAllPhotos(prev => [newPhoto, ...prev]);
        return newPhoto;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const updatePhoto = async (id, updatedFields) => {
    try {
      const res = await fetch(`http://localhost:3001/api/photos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updatedPhoto = await res.json();
        setAllPhotos(prev => prev.map(p => p.id === id ? updatedPhoto : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deletePhoto = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/photos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAllPhotos(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateAnnouncement = async (id, updatedFields) => {
    try {
      const res = await fetch(`http://localhost:3001/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updated = await res.json();
        setAllAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/announcements/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAllAnnouncements(prev => prev.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateHomework = async (id, updatedFields) => {
    try {
      const res = await fetch(`http://localhost:3001/api/homework/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updated = await res.json();
        setAllHomework(prev => prev.map(h => h.id === id ? updated : h));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHomework = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/homework/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAllHomework(prev => prev.filter(h => h.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addEvent = async (title, description, date, time, location) => {
    try {
      const res = await fetch('http://localhost:3001/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, date: new Date(date).toISOString(), time, location })
      });
      if (res.ok) {
        const newEvent = await res.json();
        setAllEvents(prev => [...prev, newEvent]);
        return newEvent;
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const updateEvent = async (id, updatedFields) => {
    try {
      const res = await fetch(`http://localhost:3001/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedFields,
          date: updatedFields.date ? new Date(updatedFields.date).toISOString() : undefined
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setAllEvents(prev => prev.map(e => e.id === id ? updated : e));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEvent = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/events/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAllEvents(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (senderId, receiverId, text) => {
    try {
      const res = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId, receiverId, text })
      });
      if (res.ok) {
        const messagesRes = await fetch('http://localhost:3001/api/messages').then(r => r.json());
        setAllMessages(messagesRes);
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  const value = {
    currentUser,
    allUsers,
    allStudents,
    allAnnouncements,
    allHomework,
    allDailyProgress,
    allPhotos,
    allEvents,
    allLeaveRequests,
    allPasswordRequests,
    allMessages,
    loginByEmail,
    registerParent,
    registerTeacher,
    logout,
    loading,

    // Actions
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addHomework,
    updateHomework,
    deleteHomework,
    updateDailyProgress,
    submitLeaveRequest,
    addPhoto,
    updatePhoto,
    deletePhoto,
    addEvent,
    updateEvent,
    deleteEvent,
    updateLeaveStatus,
    createStudent,
    updateParent,
    deleteParent,
    submitPasswordRequest,
    sendMessage
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
