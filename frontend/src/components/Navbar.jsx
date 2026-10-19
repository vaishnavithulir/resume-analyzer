import React from 'react';
import {
  Sparkles,
  History,
  LogIn,
  LogOut,
  UserCheck,
  Zap,
  FileEdit,
  Layers,
  Award,
} from 'lucide-react';

export default function Navbar({
  user,
  onOpenAuthModal,
  onLogout,
  onOpenHistory,
  historyCount,
  activeView,
  setActiveView,
}) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const navLinks = [
    { id: 'engine', label: 'Match Engine', icon: Zap },
    { id: 'studio', label: 'Resume Studio', icon: FileEdit },
    { id: 'taxonomy', label: 'Skills Universe', icon: Layers },
    { id: 'interview', label: 'Interview Prep', icon: Award },
  ];

  return (
    <header className="navbar">
      <div className="brand" onClick={() => setActiveView('engine')} style={{ cursor: 'pointer' }}>
        <div className="brand-icon">
          <Sparkles size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="brand-title">ResuVantage</h1>
            <span className="brand-badge">STUDIO PRO</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Autonomous SWE Career & Placement Suite
          </p>
        </div>
      </div>

      {/* Dynamic View Navigation Links */}
      <nav className="navbar-nav-links">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = activeView === link.id;
          return (
            <button
              key={link.id}
              type="button"
              className={`nav-tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveView(link.id)}
            >
              <Icon size={16} />
              <span>{link.label}</span>
              {isActive && <div className="nav-tab-indicator" />}
            </button>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="nav-actions">
        <button
          className="btn-icon"
          onClick={onOpenHistory}
          title="View previous analysis sessions"
          id="btn-history-toggle"
        >
          <History size={18} />
          <span>History</span>
          {historyCount > 0 && (
            <span
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
                fontSize: '0.72rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                fontWeight: 700,
              }}
            >
              {historyCount}
            </span>
          )}
        </button>

        {user ? (
          <div className="user-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.82rem',
                boxShadow: 'var(--accent-gradient-glow)',
              }}
              title={user.email}
            >
              {getInitials(user.fullName)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {user.fullName}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <UserCheck size={12} /> Logged In
              </span>
            </div>
            <button
              className="btn-icon"
              onClick={onLogout}
              title="Sign out of your account"
              id="btn-signout"
              style={{ marginLeft: '0.35rem', padding: '0.45rem 0.65rem' }}
            >
              <LogOut size={16} />
              <span style={{ display: 'none' }}>Logout</span>
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onOpenAuthModal}
            id="btn-signin-modal"
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
