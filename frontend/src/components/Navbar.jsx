import { useMemo, useState } from 'react';

const styles = {
  wrap: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    height: '60px',
    borderBottom: '1px solid rgba(108, 99, 255, 0.25)',
    background: 'rgba(13, 13, 13, 0.8)',
    backdropFilter: 'blur(12px)',
  },
  inner: {
    width: 'min(1200px, 100%)',
    height: '100%',
    margin: '0 auto',
    padding: '0 14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    color: '#fff',
    fontFamily: 'Inter, Poppins, sans-serif',
  },
  logo: {
    margin: 0,
    fontWeight: 800,
    fontSize: '1.1rem',
    letterSpacing: '0.01em',
    whiteSpace: 'nowrap',
    backgroundImage: 'linear-gradient(90deg, #6C63FF, #00F5A0, #6C63FF)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: 'logoShift 5s linear infinite',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  navLink: {
    position: 'relative',
    color: 'rgba(255, 255, 255, 0.9)',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.92rem',
    paddingBottom: '2px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconButton: {
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#fff',
    borderRadius: '10px',
    height: '36px',
    width: '36px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    minWidth: '18px',
    height: '18px',
    borderRadius: '999px',
    background: '#FF6B6B',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '1px solid rgba(255, 255, 255, 0.28)',
  },
  streak: {
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '999px',
    padding: '8px 12px',
    fontSize: '0.85rem',
    fontWeight: 700,
  },
  avatarButton: {
    position: 'relative',
    height: '36px',
    width: '36px',
    borderRadius: '50%',
    border: '1px solid rgba(108, 99, 255, 0.62)',
    background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.9), rgba(0, 245, 160, 0.7))',
    color: '#0D0D0D',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 0 18px rgba(108, 99, 255, 0.34)',
    animation: 'avatarPulse 1.9s ease-in-out infinite',
  },
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '46px',
    width: '172px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    background: 'rgba(20, 20, 32, 0.96)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
  },
  dropdownItem: {
    width: '100%',
    textAlign: 'left',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.92)',
    padding: '11px 12px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  hamburger: {
    display: 'none',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: '#fff',
    borderRadius: '10px',
    height: '36px',
    width: '36px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  mobileOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.45)',
    zIndex: 998,
  },
  mobileMenu: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: 'min(300px, 84vw)',
    height: '100vh',
    background: 'rgba(13, 13, 13, 0.98)',
    borderLeft: '1px solid rgba(108, 99, 255, 0.34)',
    boxShadow: '-14px 0 40px rgba(0, 0, 0, 0.45)',
    zIndex: 999,
    padding: '18px 14px',
    display: 'grid',
    alignContent: 'start',
    gap: '10px',
    animation: 'slideInRight 280ms ease both',
  },
  mobileLink: {
    color: '#fff',
    textDecoration: 'none',
    padding: '10px 8px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    fontWeight: 600,
  },
};

function Navbar({ username, streakCount = 7, notificationCount = 0, onLogout, user }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = username || user?.name || 'Guest';
  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'G';
  }, [displayName]);

  const navLinks = [
    { label: 'Dashboard', href: '/' },
    { label: 'Problems', href: '/problems' },
    { label: 'Mock Interview', href: '/mock' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ];

  return (
    <header style={styles.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes logoShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @keyframes avatarPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(108, 99, 255, 0.2); }
          50% { box-shadow: 0 0 20px rgba(0, 245, 160, 0.32); }
        }

        @keyframes bellBounce {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-3px); }
          60% { transform: translateY(0); }
          80% { transform: translateY(-2px); }
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .nav-link::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #6C63FF, #00F5A0);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 200ms ease;
        }

        .nav-link:hover::after {
          transform: scaleX(1);
        }

        .dropdown-item:hover {
          background: rgba(108, 99, 255, 0.16);
        }

        @media (max-width: 940px) {
          .desktop-links,
          .desktop-right {
            display: none !important;
          }

          .mobile-hamburger {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>

      <div style={styles.inner}>
        <p style={styles.logo}>⚡ AlgoCoach</p>

        <nav style={styles.links} className="desktop-links">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} style={styles.navLink} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div style={styles.right} className="desktop-right">
          <button
            type="button"
            style={{
              ...styles.iconButton,
              animation: notificationCount > 0 ? 'bellBounce 1s ease-in-out infinite' : 'none',
            }}
            aria-label="Notifications"
          >
            🔔
            {notificationCount > 0 ? <span style={styles.badge}>{notificationCount}</span> : null}
          </button>

          <span style={styles.streak}>🔥 {streakCount}</span>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              style={styles.avatarButton}
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="Open profile menu"
            >
              {initials}
            </button>

            {profileOpen ? (
              <div style={styles.dropdown}>
                <button type="button" style={styles.dropdownItem} className="dropdown-item">
                  Profile
                </button>
                <button type="button" style={styles.dropdownItem} className="dropdown-item">
                  Settings
                </button>
                <button
                  type="button"
                  style={styles.dropdownItem}
                  className="dropdown-item"
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          style={styles.hamburger}
          className="mobile-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      </div>

      {menuOpen ? (
        <>
          <div style={styles.mobileOverlay} onClick={() => setMenuOpen(false)} />
          <aside style={styles.mobileMenu}>
            <button type="button" style={styles.iconButton} onClick={() => setMenuOpen(false)} aria-label="Close menu">
              ✕
            </button>

            <div style={{ ...styles.streak, width: 'fit-content' }}>🔥 {streakCount} streak</div>

            {navLinks.map((link) => (
              <a key={link.label} href={link.href} style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}

            <button
              type="button"
              style={{ ...styles.mobileLink, textAlign: 'left', cursor: 'pointer' }}
              onClick={() => {
                setMenuOpen(false);
                if (onLogout) {
                  onLogout();
                }
              }}
            >
              Logout
            </button>
          </aside>
        </>
      ) : null}
    </header>
  );
}

export default Navbar;
