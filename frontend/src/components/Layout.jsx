import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Megaphone, BookOpen, LineChart, Camera, MessageSquare, Calendar, User, LogOut, Bird, UserPlus } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const parentNav = [
    { name: 'Dashboard', path: '/parent', icon: Home },
    { name: 'Announcements', path: '/parent/announcements', icon: Megaphone },
    { name: 'Homework', path: '/parent/homework', icon: BookOpen },
    { name: 'Daily Progress', path: '/parent/progress', icon: LineChart },
    { name: "Today's Moments", path: '/parent/moments', icon: Camera },
    { name: 'Messages', path: '/parent/messages', icon: MessageSquare },
    { name: 'Events', path: '/parent/events', icon: Calendar },
    { name: 'Profile', path: '/parent/profile', icon: User },
  ];

  const teacherNav = [
    { name: 'Dashboard', path: '/teacher', icon: Home },
    { name: 'Announcements', path: '/teacher/announcements', icon: Megaphone },
    { name: 'Homework', path: '/teacher/homework', icon: BookOpen },
    { name: 'Students & Progress', path: '/teacher/students', icon: User },
    { name: 'Create Parent', path: '/teacher/create-parent', icon: UserPlus },
    { name: 'Leave Requests', path: '/teacher/leaves', icon: Calendar },
    { name: 'Photos', path: '/teacher/photos', icon: Camera },
    { name: 'Messages', path: '/teacher/messages', icon: MessageSquare },
    { name: 'Events', path: '/teacher/events', icon: Calendar },
    { name: 'Profile', path: '/teacher/profile', icon: User },
  ];

  const navItems = currentUser?.role === 'parent' ? parentNav : teacherNav;

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bird size={24} color="var(--color-primary)" />
              <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Nestling</span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.05em', paddingLeft: '2px' }}>GREENWOOD ACADEMY</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/parent' || item.path === '/teacher'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-link logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/parent' || item.path === '/teacher'}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={24} />
            <span className="bottom-nav-label">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
