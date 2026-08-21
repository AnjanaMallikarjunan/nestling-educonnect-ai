// Mock data for initial prototype
import { addDays, subDays } from 'date-fns';

const today = new Date();

export const users = [
  {
    id: 'user_parent_1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'parent',
    childId: 'student_1',
    profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Rahul'
  },
  {
    id: 'user_teacher_1',
    name: 'Mrs. Priya',
    email: 'priya@example.com',
    role: 'teacher',
    class: 'Grade 4 - Section A',
    profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Priya'
  }
];

export const students = [
  {
    id: 'student_1',
    name: 'Ananya Sharma',
    class: 'Grade 4 - Section A',
    profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ananya',
    parentId: 'user_parent_1',
    teacherId: 'user_teacher_1'
  },
  // Add more students as needed...
  { id: 'student_2', name: 'Aarav Patel', class: 'Grade 4 - Section A', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aarav', parentId: 'user_parent_1', teacherId: 'user_teacher_1' },
  { id: 'student_3', name: 'Riya Gupta', class: 'Grade 4 - Section A', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Riya', teacherId: 'user_teacher_1' },
  { id: 'student_4', name: 'Vihaan Kumar', class: 'Grade 4 - Section A', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Vihaan', teacherId: 'user_teacher_1' },
  { id: 'student_5', name: 'Ishaan Singh', class: 'Grade 4 - Section A', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ishaan', teacherId: 'user_teacher_1' },
  { id: 'student_6', name: 'Aditya Desai', class: 'Grade 4 - Section A', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aditya', teacherId: 'user_teacher_1' },
  { id: 'student_7', name: 'Kavya Reddy', class: 'Grade 4 - Section A', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Kavya', teacherId: 'user_teacher_1' },
  { id: 'student_8', name: 'Neha Joshi', class: 'Grade 4 - Section A', profileImage: 'https://api.dicebear.com/7.x/notionists/svg?seed=Neha', teacherId: 'user_teacher_1' },
];

export const announcements = [
  {
    id: 'ann_1',
    title: 'School Closed on Friday',
    description: 'Due to severe weather warnings, the school will remain closed this Friday.',
    priority: 'urgent',
    createdBy: 'Principal',
    date: today.toISOString(),
    readBy: []
  },
  {
    id: 'ann_2',
    title: 'Annual Sports Day Registration',
    description: 'Please submit the forms for Annual Sports Day by next week.',
    priority: 'important',
    createdBy: 'Mrs. Priya',
    date: subDays(today, 1).toISOString(),
    readBy: ['user_parent_1']
  },
  {
    id: 'ann_3',
    title: 'New Library Books Added',
    description: 'We have added 50 new books to the children\'s section!',
    priority: 'general',
    createdBy: 'Librarian',
    date: subDays(today, 3).toISOString(),
    readBy: []
  }
];

export const homework = [
  {
    id: 'hw_1',
    subject: 'Mathematics',
    title: 'Exercise 4.2',
    description: 'Complete all questions from Exercise 4.2 on fractions.',
    assignedDate: today.toISOString(),
    dueDate: addDays(today, 1).toISOString(),
    teacherId: 'user_teacher_1',
    status: 'pending' // For parent view demo
  },
  {
    id: 'hw_2',
    subject: 'Science',
    title: 'Solar System Project',
    description: 'Bring materials for the solar system model tomorrow.',
    assignedDate: subDays(today, 1).toISOString(),
    dueDate: today.toISOString(),
    teacherId: 'user_teacher_1',
    status: 'completed'
  }
];

export const dailyProgress = [
  {
    id: 'prog_1',
    studentId: 'student_1',
    date: today.toISOString(),
    academicRating: 4,
    participationRating: 5,
    behaviourRating: 4,
    attendance: 'Present',
    teacherNote: 'Participated actively in today\'s science activity.'
  }
];

export const photos = [
  {
    id: 'photo_1',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    activityTitle: 'Science Activity',
    description: 'Learning about plants and leaves!',
    date: today.toISOString(),
    studentIds: ['student_1', 'student_2', 'student_3']
  },
  {
    id: 'photo_2',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&q=80&w=800',
    activityTitle: 'Art Class',
    description: 'Finger painting session was a mess but fun!',
    date: subDays(today, 1).toISOString(),
    studentIds: ['student_1', 'student_4']
  }
];

export const events = [
  {
    id: 'event_1',
    title: 'Parent-Teacher Meeting',
    description: 'End of term review.',
    date: addDays(today, 5).toISOString(),
    time: '14:00 - 16:00',
    location: 'Class 4A'
  },
  {
    id: 'event_2',
    title: 'Science Fair',
    description: 'Annual school science fair.',
    date: addDays(today, 12).toISOString(),
    time: '09:00 - 15:00',
    location: 'Main Hall'
  }
];
