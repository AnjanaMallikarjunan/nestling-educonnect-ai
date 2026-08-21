import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import LoginParent from './pages/LoginParent';
import LoginTeacher from './pages/LoginTeacher';
import Layout from './components/Layout';
import ParentDashboard from './pages/parent/ParentDashboard';
import Announcements from './pages/parent/Announcements';
import Homework from './pages/parent/Homework';
import DailyProgress from './pages/parent/DailyProgress';
import Moments from './pages/parent/Moments';
import Events from './pages/parent/Events';
import Messages from './pages/parent/Messages';
import Profile from './pages/parent/Profile';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAnnouncements from './pages/teacher/TeacherAnnouncements';
import TeacherHomework from './pages/teacher/TeacherHomework';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherPhotos from './pages/teacher/TeacherPhotos';
import TeacherEvents from './pages/teacher/TeacherEvents';
import TeacherMessages from './pages/teacher/TeacherMessages';
import CreateParent from './pages/teacher/CreateParent';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherLeaves from './pages/teacher/TeacherLeaves';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRole }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRole && currentUser.role !== allowedRole) {
    // If wrong role, redirect to appropriate dashboard
    return <Navigate to={currentUser.role === 'parent' ? '/parent' : '/teacher'} replace />;
  }
  
  return children;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      
      <Route path="/login" element={
        currentUser ? <Navigate to={currentUser.role === 'parent' ? '/parent' : '/teacher'} replace /> : <Login />
      } />
      <Route path="/login/parent" element={
        currentUser ? <Navigate to={currentUser.role === 'parent' ? '/parent' : '/teacher'} replace /> : <LoginParent />
      } />
      <Route path="/login/teacher" element={
        currentUser ? <Navigate to={currentUser.role === 'parent' ? '/parent' : '/teacher'} replace /> : <LoginTeacher />
      } />
      
      <Route path="/parent" element={
        <ProtectedRoute allowedRole="parent">
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<ParentDashboard />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="homework" element={<Homework />} />
        <Route path="progress" element={<DailyProgress />} />
        <Route path="moments" element={<Moments />} />
        <Route path="events" element={<Events />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      <Route path="/teacher" element={
        <ProtectedRoute allowedRole="teacher">
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<TeacherDashboard />} />
        <Route path="announcements" element={<TeacherAnnouncements />} />
        <Route path="homework" element={<TeacherHomework />} />
        <Route path="students" element={<TeacherStudents />} />
        <Route path="create-parent" element={<CreateParent />} />
        <Route path="photos" element={<TeacherPhotos />} />
        <Route path="events" element={<TeacherEvents />} />
        <Route path="messages" element={<TeacherMessages />} />
        <Route path="profile" element={<TeacherProfile />} />
        <Route path="leaves" element={<TeacherLeaves />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
