import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.sqlite');

const allowedOrigins = [
  'https://nestling-educonnect-ai.vercel.app',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(DB_FILE);

// Promisify database methods for clean async/await code
const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err);
    else resolve({ id: this.lastID, changes: this.changes });
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

// Setup database tables
async function initDB() {
  await run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    childId TEXT,
    profileImage TEXT,
    class TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT,
    class TEXT,
    rollNumber INTEGER,
    profileImage TEXT,
    parentId TEXT,
    teacherId TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    priority TEXT,
    createdBy TEXT,
    date TEXT,
    readBy TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS homework (
    id TEXT PRIMARY KEY,
    subject TEXT,
    title TEXT,
    description TEXT,
    assignedDate TEXT,
    dueDate TEXT,
    teacherId TEXT,
    status TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS dailyProgress (
    id TEXT PRIMARY KEY,
    studentId TEXT,
    date TEXT,
    academicRating INTEGER,
    participationRating INTEGER,
    behaviourRating INTEGER,
    attendance TEXT,
    teacherNote TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    date TEXT,
    time TEXT,
    location TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS leaveRequests (
    id TEXT PRIMARY KEY,
    studentId TEXT,
    startDate TEXT,
    endDate TEXT,
    reason TEXT,
    status TEXT,
    date TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    imageUrl TEXT,
    activityTitle TEXT,
    description TEXT,
    date TEXT,
    studentIds TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS passwordRequests (
    id TEXT PRIMARY KEY,
    parentId TEXT,
    parentName TEXT,
    date TEXT,
    status TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    senderId TEXT,
    receiverId TEXT,
    text TEXT,
    timestamp TEXT
  )`);

  // Run migration if database.json exists and SQLite is empty
  await migrateData();
  // Otherwise seed defaults if completely empty
  await seedSQLite();
}

// Seeder default database records generator
function getSeedData() {
  const today = new Date();
  const addDays = (d, days) => {
    const clone = new Date(d);
    clone.setDate(clone.getDate() + days);
    return clone;
  };
  const subDays = (d, days) => {
    const clone = new Date(d);
    clone.setDate(clone.getDate() - days);
    return clone;
  };

  return {
    users: [
      { id: 'user_parent_1', name: 'Rahul Sharma', email: 'rahul@example.com', password: 'password', role: 'parent', childId: 'student_1', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Rahul' },
      { id: 'user_teacher_1', name: 'Mrs. Priya', email: 'priya@example.com', password: 'password', role: 'teacher', class: 'Grade 4 - Section A', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Priya' },
      { id: 'user_teacher_2', name: 'Mr. Vikram Sen', email: 'vikram@example.com', password: 'password', role: 'teacher', class: 'Mathematics', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Vikram' },
      { id: 'user_teacher_3', name: 'Ms. Anjali Gupta', email: 'anjali@example.com', password: 'password', role: 'teacher', class: 'Chemistry', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Anjali' },
      { id: 'user_teacher_4', name: 'Mr. Kabir Mehta', email: 'kabir@example.com', password: 'password', role: 'teacher', class: 'English', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Kabir' }
    ],
    students: [
      { id: 'student_1', name: 'Ananya Sharma', class: 'Grade 4 - Section A', rollNumber: 101, profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ananya', parentId: 'user_parent_1', teacherId: 'user_teacher_1' },
      { id: 'student_2', name: 'Aarav Patel', class: 'Grade 4 - Section A', rollNumber: 102, profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aarav', parentId: 'user_parent_1', teacherId: 'user_teacher_1' },
      { id: 'student_3', name: 'Riya Gupta', class: 'Grade 4 - Section A', rollNumber: 103, profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Riya', teacherId: 'user_teacher_1' },
      { id: 'student_4', name: 'Vihaan Kumar', class: 'Grade 4 - Section A', rollNumber: 104, profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Vihaan', teacherId: 'user_teacher_1' },
      { id: 'student_5', name: 'Ishaan Singh', class: 'Grade 4 - Section A', rollNumber: 105, profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ishaan', teacherId: 'user_teacher_1' },
      { id: 'student_6', name: 'Aditya Desai', class: 'Grade 4 - Section A', rollNumber: 106, profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aditya', teacherId: 'user_teacher_1' },
      { id: 'student_7', name: 'Kavya Reddy', class: 'Grade 4 - Section A', rollNumber: 107, profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Kavya', teacherId: 'user_teacher_1' },
      { id: 'student_8', name: 'Neha Joshi', class: 'Grade 4 - Section A', rollNumber: 108, profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Neha', teacherId: 'user_teacher_1' }
    ],
    announcements: [
      { id: 'ann_1', title: 'School Closed on Friday', description: 'Due to severe weather warnings, the school will remain closed this Friday.', priority: 'urgent', createdBy: 'Principal', date: today.toISOString(), readBy: [] },
      { id: 'ann_2', title: 'Annual Sports Day Registration', description: 'Please submit the forms for Annual Sports Day by next week.', priority: 'important', createdBy: 'Mrs. Priya', date: subDays(today, 1).toISOString(), readBy: ['user_parent_1'] },
      { id: 'ann_3', title: 'New Library Books Added', description: 'We have added 50 new books to the children\'s section!', priority: 'general', createdBy: 'Librarian', date: subDays(today, 3).toISOString(), readBy: [] }
    ],
    homework: [
      { id: 'hw_1', subject: 'Mathematics', title: 'Exercise 4.2', description: 'Complete all questions from Exercise 4.2 on fractions.', assignedDate: today.toISOString(), dueDate: addDays(today, 1).toISOString(), teacherId: 'user_teacher_1', status: 'pending' },
      { id: 'hw_2', subject: 'Science', title: 'Solar System Project', description: 'Bring materials for the solar system model tomorrow.', assignedDate: subDays(today, 1).toISOString(), dueDate: today.toISOString(), teacherId: 'user_teacher_1', status: 'completed' }
    ],
    dailyProgress: [
      { id: 'prog_1', studentId: 'student_1', date: today.toISOString(), academicRating: 4, participationRating: 5, behaviourRating: 4, attendance: 'Present', teacherNote: 'Participated actively in today\'s science activity.' }
    ],
    events: [
      { id: 'event_1', title: 'Parent-Teacher Meeting', description: 'End of term review.', date: addDays(today, 5).toISOString(), time: '14:00 - 16:00', location: 'Class 4A' },
      { id: 'event_2', title: 'Science Fair', description: 'Annual school science fair.', date: addDays(today, 12).toISOString(), time: '09:00 - 15:00', location: 'Main Hall' }
    ]
  };
}

async function migrateData() {
  const jsonPath = path.join(__dirname, 'database.json');
  if (!fs.existsSync(jsonPath)) return;
  
  try {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const data = JSON.parse(raw);
    
    // Check if migration is already done
    const userCount = await get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) {
      console.log('Database already populated. Skipping migration.');
      return;
    }
    
    console.log('Migrating existing data from database.json to SQLite...');
    
    if (data.users) {
      for (const u of data.users) {
        await run(`INSERT OR IGNORE INTO users (id, name, email, password, role, childId, profileImage, class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.id, u.name, u.email, u.password || 'password', u.role, u.childId, u.profileImage, u.class]);
      }
    }
    
    if (data.students) {
      for (const s of data.students) {
        await run(`INSERT OR IGNORE INTO students (id, name, class, rollNumber, profileImage, parentId, teacherId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [s.id, s.name, s.class, s.rollNumber, s.profileImage, s.parentId, s.teacherId]);
      }
    }
    
    if (data.announcements) {
      for (const a of data.announcements) {
        await run(`INSERT OR IGNORE INTO announcements (id, title, description, priority, createdBy, date, readBy) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [a.id, a.title, a.description, a.priority, a.createdBy, a.date, JSON.stringify(a.readBy || [])]);
      }
    }
    
    if (data.homework) {
      for (const h of data.homework) {
        await run(`INSERT OR IGNORE INTO homework (id, subject, title, description, assignedDate, dueDate, teacherId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [h.id, h.subject, h.title, h.description, h.assignedDate, h.dueDate, h.teacherId, h.status]);
      }
    }
    
    if (data.dailyProgress) {
      for (const p of data.dailyProgress) {
        await run(`INSERT OR IGNORE INTO dailyProgress (id, studentId, date, academicRating, participationRating, behaviourRating, attendance, teacherNote) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [p.id, p.studentId, p.date, p.academicRating, p.participationRating, p.behaviourRating, p.attendance, p.teacherNote]);
      }
    }
    
    if (data.events) {
      for (const e of data.events) {
        await run(`INSERT OR IGNORE INTO events (id, title, description, date, time, location) VALUES (?, ?, ?, ?, ?, ?)`,
          [e.id, e.title, e.description, e.date, e.time, e.location]);
      }
    }
    
    if (data.leaveRequests) {
      for (const l of data.leaveRequests) {
        await run(`INSERT OR IGNORE INTO leaveRequests (id, studentId, startDate, endDate, reason, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [l.id, l.studentId, l.startDate, l.endDate, l.reason, l.status, l.date]);
      }
    }
    
    if (data.photos) {
      for (const p of data.photos) {
        await run(`INSERT OR IGNORE INTO photos (id, imageUrl, activityTitle, description, date, studentIds) VALUES (?, ?, ?, ?, ?, ?)`,
          [p.id, p.imageUrl, p.activityTitle, p.description, p.date, JSON.stringify(p.studentIds || [])]);
      }
    }
    
    if (data.passwordRequests) {
      for (const p of data.passwordRequests) {
        await run(`INSERT OR IGNORE INTO passwordRequests (id, parentId, parentName, date, status) VALUES (?, ?, ?, ?, ?)`,
          [p.id, p.parentId, p.parentName, p.date, p.status]);
      }
    }

    if (data.messages) {
      for (const m of data.messages) {
        await run(`INSERT INTO messages (senderId, receiverId, text, timestamp) VALUES (?, ?, ?, ?)`,
          [m.senderId, m.receiverId, m.text, m.timestamp]);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

async function seedSQLite() {
  const userCount = await get('SELECT COUNT(*) as count FROM users');
  if (userCount.count > 0) return;
  
  console.log('Seeding SQLite database with default mock data...');
  const seed = getSeedData();
  
  for (const u of seed.users) {
    await run(`INSERT OR IGNORE INTO users (id, name, email, password, role, childId, profileImage, class) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.password || 'password', u.role, u.childId, u.profileImage, u.class]);
  }
  
  for (const s of seed.students) {
    await run(`INSERT OR IGNORE INTO students (id, name, class, rollNumber, profileImage, parentId, teacherId) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.name, s.class, s.rollNumber, s.profileImage, s.parentId, s.teacherId]);
  }
  
  for (const a of seed.announcements) {
    await run(`INSERT OR IGNORE INTO announcements (id, title, description, priority, createdBy, date, readBy) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.title, a.description, a.priority, a.createdBy, a.date, JSON.stringify(a.readBy || [])]);
  }
  
  for (const h of seed.homework) {
    await run(`INSERT OR IGNORE INTO homework (id, subject, title, description, assignedDate, dueDate, teacherId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [h.id, h.subject, h.title, h.description, h.assignedDate, h.dueDate, h.teacherId, h.status]);
  }
  
  for (const p of seed.dailyProgress) {
    await run(`INSERT OR IGNORE INTO dailyProgress (id, studentId, date, academicRating, participationRating, behaviourRating, attendance, teacherNote) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.studentId, p.date, p.academicRating, p.participationRating, p.behaviourRating, p.attendance, p.teacherNote]);
  }
  
  for (const e of seed.events) {
    await run(`INSERT OR IGNORE INTO events (id, title, description, date, time, location) VALUES (?, ?, ?, ?, ?, ?)`,
      [e.id, e.title, e.description, e.date, e.time, e.location]);
  }

  const messageCount = await get('SELECT COUNT(*) as count FROM messages');
  if (messageCount.count === 0) {
    await run(`INSERT INTO messages (senderId, receiverId, text, timestamp) VALUES (?, ?, ?, ?)`,
      ["user_teacher_1", "user_parent_1", "Hello! Ananya is doing great today.", "19:05"]);
    await run(`INSERT INTO messages (senderId, receiverId, text, timestamp) VALUES (?, ?, ?, ?)`,
      ["user_parent_1", "user_teacher_1", "Thank you for the update!", "19:10"]);
  }
}

// 1. Auth Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await get('SELECT * FROM users WHERE LOWER(email) = ?', [email.toLowerCase()]);
    if (user && user.password === password) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Fetch Students Endpoint
app.get('/api/students', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM students');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  const { name, className, rollNumber } = req.body;
  const newStudent = {
    id: 'student_' + Date.now(),
    name,
    class: className || 'Grade 4 - Section A',
    rollNumber: parseInt(rollNumber),
    profileImage: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`,
    teacherId: 'user_teacher_1'
  };
  try {
    await run(`INSERT INTO students (id, name, class, rollNumber, profileImage, teacherId) VALUES (?, ?, ?, ?, ?, ?)`,
      [newStudent.id, newStudent.name, newStudent.class, newStudent.rollNumber, newStudent.profileImage, newStudent.teacherId]);
    res.json(newStudent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Announcements Endpoints
app.get('/api/announcements', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM announcements');
    const mapped = rows.map(r => ({
      ...r,
      readBy: JSON.parse(r.readBy || '[]')
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  const { title, description, priority, createdBy } = req.body;
  const newAnn = {
    id: 'ann_' + Date.now(),
    title,
    description,
    priority,
    createdBy,
    date: new Date().toISOString(),
    readBy: []
  };
  try {
    await run(`INSERT INTO announcements (id, title, description, priority, createdBy, date, readBy) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newAnn.id, newAnn.title, newAnn.description, newAnn.priority, newAnn.createdBy, newAnn.date, JSON.stringify([])]);
    res.json(newAnn);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Homework Endpoints
app.get('/api/homework', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM homework');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/homework', async (req, res) => {
  const { subject, title, description, dueDate, teacherId } = req.body;
  const newHw = {
    id: 'hw_' + Date.now(),
    subject,
    title,
    description,
    assignedDate: new Date().toISOString(),
    dueDate,
    teacherId,
    status: 'pending'
  };
  try {
    await run(`INSERT INTO homework (id, subject, title, description, assignedDate, dueDate, teacherId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [newHw.id, newHw.subject, newHw.title, newHw.description, newHw.assignedDate, newHw.dueDate, newHw.teacherId, newHw.status]);
    res.json(newHw);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/homework/:id', async (req, res) => {
  const { id } = req.params;
  const { status, subject, title, description, dueDate } = req.body;
  try {
    const hw = await get('SELECT * FROM homework WHERE id = ?', [id]);
    if (hw) {
      const updatedStatus = status !== undefined ? status : hw.status;
      const updatedSubject = subject !== undefined ? subject : hw.subject;
      const updatedTitle = title !== undefined ? title : hw.title;
      const updatedDescription = description !== undefined ? description : hw.description;
      const updatedDueDate = dueDate !== undefined ? dueDate : hw.dueDate;
      
      await run(`UPDATE homework SET status = ?, subject = ?, title = ?, description = ?, dueDate = ? WHERE id = ?`,
        [updatedStatus, updatedSubject, updatedTitle, updatedDescription, updatedDueDate, id]);
      
      res.json({
        ...hw,
        status: updatedStatus,
        subject: updatedSubject,
        title: updatedTitle,
        description: updatedDescription,
        dueDate: updatedDueDate
      });
    } else {
      res.status(404).json({ message: 'Homework not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/homework/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM homework WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Daily Progress Endpoints
app.get('/api/daily-progress', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM dailyProgress');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/daily-progress', async (req, res) => {
  const { studentId, attendance, academicRating, behaviourRating, participationRating, teacherNote } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];
  try {
    const existing = await get(`SELECT * FROM dailyProgress WHERE studentId = ? AND date LIKE ?`, [studentId, todayStr + '%']);
    
    const progressRecord = {
      id: existing ? existing.id : 'prog_' + Date.now(),
      studentId,
      date: new Date().toISOString(),
      attendance,
      academicRating,
      behaviourRating,
      participationRating,
      teacherNote
    };

    if (existing) {
      await run(`UPDATE dailyProgress SET date = ?, attendance = ?, academicRating = ?, behaviourRating = ?, participationRating = ?, teacherNote = ? WHERE id = ?`,
        [progressRecord.date, progressRecord.attendance, progressRecord.academicRating, progressRecord.behaviourRating, progressRecord.participationRating, progressRecord.teacherNote, progressRecord.id]);
    } else {
      await run(`INSERT INTO dailyProgress (id, studentId, date, academicRating, participationRating, behaviourRating, attendance, teacherNote) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [progressRecord.id, progressRecord.studentId, progressRecord.date, progressRecord.academicRating, progressRecord.participationRating, progressRecord.behaviourRating, progressRecord.attendance, progressRecord.teacherNote]);
    }
    res.json(progressRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Upcoming Events Endpoint
app.get('/api/events', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM events');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. Submit Leave Request
app.post('/api/leave', async (req, res) => {
  const { studentId, startDate, endDate, reason } = req.body;
  const newRequest = {
    id: 'leave_' + Date.now(),
    studentId,
    startDate,
    endDate,
    reason,
    status: 'pending',
    date: new Date().toISOString()
  };
  try {
    await run(`INSERT INTO leaveRequests (id, studentId, startDate, endDate, reason, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newRequest.id, newRequest.studentId, newRequest.startDate, newRequest.endDate, newRequest.reason, newRequest.status, newRequest.date]);
    res.json({ success: true, request: newRequest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/leave', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM leaveRequests');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/leave/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const existing = await get('SELECT * FROM leaveRequests WHERE id = ?', [id]);
    if (existing) {
      await run('UPDATE leaveRequests SET status = ? WHERE id = ?', [status, id]);
      res.json({ ...existing, status });
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/password-request', async (req, res) => {
  const { parentId, parentName } = req.body;
  const newRequest = {
    id: 'req_' + Date.now(),
    parentId,
    parentName,
    date: new Date().toISOString(),
    status: 'pending'
  };
  try {
    await run(`INSERT INTO passwordRequests (id, parentId, parentName, date, status) VALUES (?, ?, ?, ?, ?)`,
      [newRequest.id, newRequest.parentId, newRequest.parentName, newRequest.date, newRequest.status]);
    res.json(newRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/password-request', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM passwordRequests');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. Register Teacher Endpoint
app.post('/api/register-teacher', async (req, res) => {
  const { name, email, inviteCode } = req.body;
  if (inviteCode !== 'TEACH2026') {
    return res.status(400).json({ success: false, message: 'Invalid invite code' });
  }
  const newUser = {
    id: 'user_teacher_' + Date.now(),
    name,
    email,
    role: 'teacher',
    class: 'Grade 4 - Section A',
    profileImage: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`
  };
  try {
    await run(`INSERT INTO users (id, name, email, role, class, profileImage) VALUES (?, ?, ?, ?, ?, ?)`,
      [newUser.id, newUser.name, newUser.email, newUser.role, newUser.class, newUser.profileImage]);
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 9. Register Parent Endpoint
app.post('/api/register-parent', async (req, res) => {
  const { name, email, password, childId, inviteCode } = req.body;
  if (inviteCode !== 'NEST2026') {
    return res.status(400).json({ success: false, message: 'Invalid invite code' });
  }
  const newUser = {
    id: 'user_parent_' + Date.now(),
    name,
    email,
    password: password || 'password',
    role: 'parent',
    childId: childId || 'student_2',
    profileImage: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}`
  };
  try {
    await run(`INSERT INTO users (id, name, email, password, role, childId, profileImage) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newUser.id, newUser.name, newUser.email, newUser.password, newUser.role, newUser.childId, newUser.profileImage]);
      
    if (childId) {
      await run(`UPDATE students SET parentId = ? WHERE id = ?`, [newUser.id, childId]);
    }
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 10. Fetch Users Directory Endpoint
app.get('/api/users', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, childId } = req.body;
  try {
    const user = await get('SELECT * FROM users WHERE id = ?', [id]);
    if (user) {
      const oldChildId = user.childId;
      const uName = name !== undefined ? name : user.name;
      const uEmail = email !== undefined ? email : user.email;
      const uPass = password !== undefined ? password : user.password;
      const uChildId = childId !== undefined ? childId : user.childId;
      
      await run(`UPDATE users SET name = ?, email = ?, password = ?, childId = ? WHERE id = ?`,
        [uName, uEmail, uPass, uChildId, id]);
        
      if (childId !== undefined) {
        if (oldChildId && oldChildId !== uChildId) {
          await run(`UPDATE students SET parentId = NULL WHERE id = ? AND parentId = ?`, [oldChildId, id]);
        }
        if (uChildId) {
          await run(`UPDATE students SET parentId = ? WHERE id = ?`, [id, uChildId]);
        }
      }
      
      res.json({ ...user, name: uName, email: uEmail, password: uPass, childId: uChildId });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await get('SELECT * FROM users WHERE id = ?', [id]);
    if (user) {
      await run('DELETE FROM users WHERE id = ?', [id]);
      await run('UPDATE students SET parentId = NULL WHERE parentId = ?', [id]);
      res.json({ success: true, message: 'User deleted' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 11. Photos Endpoints
app.get('/api/photos', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM photos');
    const mapped = rows.map(r => ({
      ...r,
      studentIds: JSON.parse(r.studentIds || '[]')
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/photos', async (req, res) => {
  const { imageUrl, activityTitle, description } = req.body;
  const newPhoto = {
    id: 'photo_' + Date.now(),
    imageUrl,
    activityTitle,
    description,
    date: new Date().toISOString(),
    studentIds: []
  };
  try {
    await run(`INSERT INTO photos (id, imageUrl, activityTitle, description, date, studentIds) VALUES (?, ?, ?, ?, ?, ?)`,
      [newPhoto.id, newPhoto.imageUrl, newPhoto.activityTitle, newPhoto.description, newPhoto.date, JSON.stringify([])]);
    res.json(newPhoto);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/photos/:id', async (req, res) => {
  const { id } = req.params;
  const { imageUrl, activityTitle, description } = req.body;
  try {
    const existing = await get('SELECT * FROM photos WHERE id = ?', [id]);
    if (existing) {
      const uUrl = imageUrl !== undefined ? imageUrl : existing.imageUrl;
      const uTitle = activityTitle !== undefined ? activityTitle : existing.activityTitle;
      const uDesc = description !== undefined ? description : existing.description;
      
      await run(`UPDATE photos SET imageUrl = ?, activityTitle = ?, description = ? WHERE id = ?`,
        [uUrl, uTitle, uDesc, id]);
        
      res.json({
        ...existing,
        imageUrl: uUrl,
        activityTitle: uTitle,
        description: uDesc,
        studentIds: JSON.parse(existing.studentIds || '[]')
      });
    } else {
      res.status(404).json({ message: 'Photo not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/photos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM photos WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Announcements Edit/Delete
app.put('/api/announcements/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, priority } = req.body;
  try {
    const existing = await get('SELECT * FROM announcements WHERE id = ?', [id]);
    if (existing) {
      const uTitle = title !== undefined ? title : existing.title;
      const uDesc = description !== undefined ? description : existing.description;
      const uPri = priority !== undefined ? priority : existing.priority;
      
      await run(`UPDATE announcements SET title = ?, description = ?, priority = ? WHERE id = ?`,
        [uTitle, uDesc, uPri, id]);
        
      res.json({
        ...existing,
        title: uTitle,
        description: uDesc,
        priority: uPri,
        readBy: JSON.parse(existing.readBy || '[]')
      });
    } else {
      res.status(404).json({ message: 'Announcement not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Homework Edit/Delete
app.put('/api/homework/:id', async (req, res) => {
  const { id } = req.params;
  const { subject, title, description, dueDate } = req.body;
  try {
    const existing = await get('SELECT * FROM homework WHERE id = ?', [id]);
    if (existing) {
      const uSub = subject !== undefined ? subject : existing.subject;
      const uTitle = title !== undefined ? title : existing.title;
      const uDesc = description !== undefined ? description : existing.description;
      const uDue = dueDate !== undefined ? dueDate : existing.dueDate;
      
      await run(`UPDATE homework SET subject = ?, title = ?, description = ?, dueDate = ? WHERE id = ?`,
        [uSub, uTitle, uDesc, uDue, id]);
        
      res.json({
        ...existing,
        subject: uSub,
        title: uTitle,
        description: uDesc,
        dueDate: uDue
      });
    } else {
      res.status(404).json({ message: 'Homework not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/homework/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM homework WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Events CRUD
app.post('/api/events', async (req, res) => {
  const { title, description, date, time, location } = req.body;
  const newEvent = {
    id: 'event_' + Date.now(),
    title,
    description,
    date,
    time,
    location
  };
  try {
    await run(`INSERT INTO events (id, title, description, date, time, location) VALUES (?, ?, ?, ?, ?, ?)`,
      [newEvent.id, newEvent.title, newEvent.description, newEvent.date, newEvent.time, newEvent.location]);
    res.json(newEvent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, date, time, location } = req.body;
  try {
    const existing = await get('SELECT * FROM events WHERE id = ?', [id]);
    if (existing) {
      const uTitle = title !== undefined ? title : existing.title;
      const uDesc = description !== undefined ? description : existing.description;
      const uDate = date !== undefined ? date : existing.date;
      const uTime = time !== undefined ? time : existing.time;
      const uLoc = location !== undefined ? location : existing.location;
      
      await run(`UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ? WHERE id = ?`,
        [uTitle, uDesc, uDate, uTime, uLoc, id]);
        
      res.json({ id, title: uTitle, description: uDesc, date: uDate, time: uTime, location: uLoc });
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await run('DELETE FROM events WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Messages Endpoints
app.get('/api/messages', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM messages ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  const { senderId, receiverId, text } = req.body;
  const now = new Date();
  const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  try {
    await run('INSERT INTO messages (senderId, receiverId, text, timestamp) VALUES (?, ?, ?, ?)',
      [senderId, receiverId, text, timestamp]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 3001;

// Initialize Database & Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Nestling database server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize database:", err);
});
