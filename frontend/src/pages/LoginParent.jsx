import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bird, Mail, Lock, Users, AlertCircle, Eye, EyeOff, Check, X, ShieldAlert } from 'lucide-react';
import './Login.css';

export default function LoginParent() {
  const { loginByEmail, allStudents, registerParent, submitPasswordRequest, allUsers } = useAuth();
  const navigate = useNavigate();

  // Remember me logic
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('nestling_saved_email_parent') || '';
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('nestling_remember_parent') === 'true';
  });

  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Invite states
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteChildId, setInviteChildId] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    // Simulate network delay
    setTimeout(async () => {
      const success = await loginByEmail(email, password, 'parent');
      setLoading(false);
      if (success) {
        if (rememberMe) {
          localStorage.setItem('nestling_remember_parent', 'true');
          localStorage.setItem('nestling_saved_email_parent', email);
        } else {
          localStorage.removeItem('nestling_remember_parent');
          localStorage.removeItem('nestling_saved_email_parent');
        }
        navigate('/parent');
      } else {
        setError('Incorrect email or password. Please try again or ask your teacher to verify your registration.');
      }
    }, 800);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address in the field above to request a reset.');
      return;
    }
    setError('');
    setInfoMessage('');
    setLoading(true);

    const parentUser = (allUsers || []).find(
      u => u.email?.toLowerCase() === email.trim().toLowerCase() && u.role === 'parent'
    );

    if (parentUser) {
      const ok = await submitPasswordRequest(parentUser.id, parentUser.name);
      setLoading(false);
      if (ok) {
        setInfoMessage(`Password reset request sent successfully! Your child's class teacher has been notified.`);
      } else {
        setError('Failed to submit reset request. Please try again.');
      }
    } else {
      setLoading(false);
      setError('No registered parent account found matching this email address.');
    }
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    setInviteError('');
    
    if (!inviteCode.trim()) {
      setInviteError('Please enter a valid invite code.');
      return;
    }

    if (!inviteChildId) {
      setInviteError('Please select your child from the enrollment list.');
      return;
    }

    // Register parent
    try {
      registerParent(inviteName, inviteEmail, invitePassword, inviteChildId);
      setInviteSuccess(true);
      setEmail(inviteEmail);
      setTimeout(() => {
        setInviteSuccess(false);
        setInviteOpen(false);
        // Clear fields
        setInviteCode('');
        setInviteName('');
        setInviteEmail('');
        setInvitePassword('');
        setInviteChildId('');
      }, 1500);
    } catch (err) {
      setInviteError('Registration failed. Please check details or contact support.');
    }
  };



  // Find students that don't have parents assigned yet (or all if empty)
  const availableStudents = allStudents.filter(s => !s.parentId);

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="logo-container">
          <div className="logo-icon" style={{ backgroundColor: 'var(--color-general)' }}>
            <Bird size={48} color="white" />
          </div>
          <h1>Nestling</h1>
          <p className="tagline">Parent Portal Connection</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          <div className="form-group" style={{ marginBottom: '0' }}>
            <label htmlFor="email" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={16} /> Parent Email Address
            </label>
            <input 
              id="email"
              type="email" 
              className="form-control" 
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Lock size={16} /> Password
              </label>
              <button 
                type="button" 
                onClick={handleForgotPassword} 
                style={{ fontSize: '0.8rem', color: 'var(--color-general)', fontWeight: '600', marginBottom: '0.5rem' }}
              >
                Forgot password?
              </button>
            </div>
            
            <div className="password-input-container">
              <input 
                id="password"
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0' }}>
            <input 
              id="remember-me"
              type="checkbox" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--color-general)', cursor: 'pointer' }}
            />
            <label htmlFor="remember-me" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', cursor: 'pointer', userSelect: 'none' }}>
              Remember me on this trusted device
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.85rem', backgroundColor: 'var(--color-general)' }}
            disabled={loading}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <svg className="animate-spin" style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px' }} viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In as Parent'
            )}
          </button>
        </form>

        {/* Inline success and error feedback below form */}
        {error && (
          <div className="toast-success" style={{ backgroundColor: 'var(--color-urgent-bg)', border: '1px solid var(--color-urgent)', color: 'var(--color-urgent)', marginTop: '1rem', marginBottom: '0px' }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem', textAlign: 'left' }}>{error}</span>
          </div>
        )}

        {infoMessage && (
          <div className="toast-success" style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success)', color: 'var(--color-primary)', marginTop: '1rem', marginBottom: '0px' }}>
            <Check size={20} />
            <span style={{ fontSize: '0.9rem', textAlign: 'left' }}>{infoMessage}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {/* Invite Code entry option */}
          <button 
            type="button"
            onClick={() => setInviteOpen(true)}
            style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: '600', textDecoration: 'underline' }}
          >
            Have an invite code? Sign up here
          </button>



          <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            Are you a teacher? <Link to="/login/teacher" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Teacher Sign In →</Link>
          </div>
        </div>
      </div>

      {/* Invite Code signup modal */}
      {inviteOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              type="button" 
              onClick={() => setInviteOpen(false)}
              style={{ position: 'absolute', right: '1.25rem', top: '1.25rem', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>School Invite Signup</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Enter the invite code from your child's school to create your parent profile.
            </p>

            {inviteSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Check size={28} />
                </div>
                <h3>Welcome to Nestling!</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Your parent account has been successfully created. Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label htmlFor="invite-code">Invite Code</label>
                  <input 
                    id="invite-code"
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. NEST50"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label htmlFor="invite-name">Full Name</label>
                  <input 
                    id="invite-name"
                    type="text" 
                    className="form-control" 
                    placeholder="Parent Full Name"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label htmlFor="invite-email">Email Address</label>
                  <input 
                    id="invite-email"
                    type="email" 
                    className="form-control" 
                    placeholder="your@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label htmlFor="invite-password">Password</label>
                  <input 
                    id="invite-password"
                    type="password" 
                    className="form-control" 
                    placeholder="••••••••"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label htmlFor="invite-child">Select Enrolled Child</label>
                  <select 
                    id="invite-child"
                    className="form-control"
                    value={inviteChildId}
                    onChange={(e) => setInviteChildId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose child --</option>
                    {availableStudents.length === 0 ? (
                      allStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                      ))
                    ) : (
                      availableStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.class})</option>
                      ))
                    )}
                  </select>
                </div>

                {inviteError && (
                  <div style={{ color: 'var(--color-urgent)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ShieldAlert size={16} />
                    <span>{inviteError}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '0.5rem', backgroundColor: 'var(--color-general)' }}
                >
                  Create Parent Account
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
