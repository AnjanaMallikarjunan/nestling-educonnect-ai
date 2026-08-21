import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bird, GraduationCap, Users } from 'lucide-react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="logo-container">
          <div className="logo-icon">
            <Bird size={48} color="white" />
          </div>
          <h1>Nestling</h1>
          <p className="tagline">"Everything about your child's school life, in one place."</p>
        </div>

        <div className="role-selection">
          <h2>Select Your Portal</h2>
          
          <button className="role-btn parent-btn" onClick={() => navigate('/login/parent')}>
            <Users size={32} color="var(--color-general)" />
            <div className="role-text">
              <h3>Parent Portal</h3>
              <p>View daily progress, photos, and chat with teachers.</p>
            </div>
          </button>

          <button className="role-btn teacher-btn" onClick={() => navigate('/login/teacher')}>
            <GraduationCap size={32} color="var(--color-primary)" />
            <div className="role-text">
              <h3>Teacher Portal</h3>
              <p>Manage classes, post homework, and message parents.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
