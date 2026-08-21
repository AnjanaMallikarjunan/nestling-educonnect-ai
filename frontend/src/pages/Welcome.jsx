import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bird, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Welcome.css';

export default function Welcome() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (currentUser) {
      logout();
    }
    navigate('/login');
  };

  return (
    <main className="welcome-container">
      {/* Soft abstract decorative blobs */}
      <div className="blob-container" aria-hidden="true">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="welcome-content">
        {/* Visual Brand Identity Logo */}
        <div className="welcome-logo-container" aria-label="Nestling Logo">
          <Bird size={48} strokeWidth={2.2} />
        </div>

        {/* Brand Information */}
        <h1 className="welcome-title animate-item anim-title">
          Nestling
        </h1>

        <p className="welcome-tagline animate-item anim-tagline">
          "Everything about your child's school life, in one place."
        </p>

        <p className="welcome-desc animate-item anim-desc">
          Connect parents and teachers, stay updated on your child's progress, and never miss an important school moment.
        </p>

        {/* CTA Button */}
        <div className="animate-item anim-btn">
          <button 
            type="button"
            className="get-started-btn"
            onClick={handleGetStarted}
            aria-label="Get started with Nestling portal selection"
          >
            Get Started <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}
