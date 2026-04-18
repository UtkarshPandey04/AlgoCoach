import { useEffect, useMemo, useState } from 'react';

const defaultStats = [
  { label: 'Problems Solved', value: 42, suffix: '' },
  { label: 'Current Streak', value: 7, suffix: ' days 🔥' },
  { label: 'AI Hints Used', value: 15, suffix: '' },
  { label: 'Accuracy', value: 78, suffix: '%' },
];

const defaultRecentActivity = [
  { title: 'Two Sum', meta: 'Arrays · 2m ago', status: 'Solved' },
  { title: 'Binary Tree Zigzag', meta: 'Trees · 18m ago', status: 'Review' },
  { title: 'Coin Change', meta: 'DP · 1h ago', status: 'Attempted' },
];

const topicDefaults = [
  { topic: 'Arrays', progress: 78 },
  { topic: 'Trees', progress: 64 },
  { topic: 'DP', progress: 52 },
  { topic: 'Graphs', progress: 69 },
];

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(108, 99, 255, 0.22), transparent 24%), radial-gradient(circle at top right, rgba(0, 245, 160, 0.14), transparent 20%), linear-gradient(180deg, #0d0d0d 0%, #101018 100%)',
    color: '#ffffff',
    fontFamily: 'Inter, Poppins, sans-serif',
    padding: '32px 20px 40px',
    overflow: 'hidden',
    position: 'relative',
  },
  shell: {
    width: 'min(1200px, 100%)',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    display: 'grid',
    gap: '18px',
    marginBottom: '28px',
    animation: 'dashboardFadeIn 900ms ease both',
  },
  eyebrow: {
    margin: 0,
    color: '#00F5A0',
    fontSize: '0.82rem',
    fontWeight: 800,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(2rem, 4vw, 4.25rem)',
    lineHeight: 1.02,
    letterSpacing: '-0.05em',
    textShadow: '0 0 30px rgba(108, 99, 255, 0.16)',
  },
  typingLine: {
    margin: 0,
    maxWidth: '760px',
    color: 'rgba(255, 255, 255, 0.76)',
    fontSize: '1rem',
    lineHeight: 1.7,
  },
  typingCursor: {
    display: 'inline-block',
    width: '10px',
    marginLeft: '3px',
    color: '#00F5A0',
    animation: 'cursorBlink 900ms step-end infinite',
  },
  topRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.6fr) minmax(260px, 0.9fr)',
    gap: '18px',
    alignItems: 'stretch',
  },
  card: {
    position: 'relative',
    background: 'rgba(26, 26, 46, 0.72)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    borderRadius: '24px',
    padding: '22px',
    backdropFilter: 'blur(18px)',
    boxShadow: '0 16px 50px rgba(0, 0, 0, 0.35)',
    overflow: 'hidden',
  },
  heroCard: {
    display: 'grid',
    gap: '18px',
  },
  heroMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '999px',
    background: 'rgba(108, 99, 255, 0.16)',
    border: '1px solid rgba(108, 99, 255, 0.26)',
    color: '#fff',
    fontSize: '0.88rem',
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    color: 'rgba(255, 255, 255, 0.72)',
    lineHeight: 1.7,
  },
  actionRow: {
    display: 'grid',
    gap: '12px',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  actionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    minHeight: '52px',
    padding: '14px 18px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.96), rgba(13, 13, 13, 0.92))',
    textDecoration: 'none',
    fontWeight: 700,
    transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
  },
  actionButtonAlt: {
    background: 'linear-gradient(135deg, rgba(0, 245, 160, 0.95), rgba(26, 26, 46, 0.92))',
    color: '#06110d',
  },
  actionButtonThird: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.10), rgba(108, 99, 255, 0.18))',
  },
  statsGrid: {
    marginTop: '18px',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
  },
  statCard: {
    position: 'relative',
    minHeight: '160px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.92), rgba(26, 26, 46, 0.72))',
    borderRadius: '24px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    boxShadow: '0 14px 32px rgba(0, 0, 0, 0.24)',
    backdropFilter: 'blur(16px)',
    transform: 'translateY(0)',
    transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
    overflow: 'hidden',
  },
  statLabel: {
    margin: 0,
    color: 'rgba(255, 255, 255, 0.68)',
    fontSize: '0.86rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
  },
  statValue: {
    margin: '10px 0 0',
    fontSize: 'clamp(2rem, 4vw, 3.25rem)',
    lineHeight: 1,
    letterSpacing: '-0.06em',
  },
  statSuffix: {
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 700,
    opacity: 0.9,
  },
  statHelper: {
    margin: '10px 0 0',
    color: 'rgba(255, 255, 255, 0.62)',
    fontSize: '0.88rem',
  },
  sectionCard: {
    marginTop: '18px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  recentGrid: {
    marginTop: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '14px',
  },
  recentItem: {
    padding: '16px',
    borderRadius: '18px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    minHeight: '118px',
  },
  recentTitle: {
    margin: 0,
    fontWeight: 800,
    fontSize: '1rem',
  },
  recentMeta: {
    margin: '8px 0 0',
    color: 'rgba(255, 255, 255, 0.62)',
    fontSize: '0.9rem',
  },
  recentStatus: {
    display: 'inline-flex',
    marginTop: '14px',
    padding: '8px 10px',
    borderRadius: '999px',
    background: 'rgba(0, 245, 160, 0.12)',
    color: '#00F5A0',
    fontSize: '0.82rem',
    fontWeight: 700,
  },
  topicsWrap: {
    marginTop: '18px',
    display: 'grid',
    gap: '14px',
  },
  topicRow: {
    display: 'grid',
    gap: '8px',
  },
  topicHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  topicLabel: {
    margin: 0,
    fontWeight: 700,
  },
  topicPercent: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
  },
  progressTrack: {
    width: '100%',
    height: '12px',
    borderRadius: '999px',
    background: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, #6C63FF 0%, #00F5A0 100%)',
    boxShadow: '0 0 18px rgba(0, 245, 160, 0.24)',
    transition: 'width 900ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  floatingOrb: {
    position: 'absolute',
    borderRadius: '999px',
    filter: 'blur(20px)',
    pointerEvents: 'none',
  },
  orbOne: {
    top: '-20px',
    right: '7%',
    width: '180px',
    height: '180px',
    background: 'radial-gradient(circle, rgba(108, 99, 255, 0.28), transparent 70%)',
    animation: 'pulseGlow 6s ease-in-out infinite',
  },
  orbTwo: {
    bottom: '-30px',
    left: '5%',
    width: '220px',
    height: '220px',
    background: 'radial-gradient(circle, rgba(0, 245, 160, 0.18), transparent 70%)',
    animation: 'floatCard 8s ease-in-out infinite',
  },
};

function Dashboard({ username = 'Coder', stats = {}, recentActivity = [] }) {
  const mergedStats = useMemo(() => {
    const source = {
      problemsSolved: defaultStats[0].value,
      currentStreak: defaultStats[1].value,
      aiHintsUsed: defaultStats[2].value,
      accuracy: defaultStats[3].value,
      ...stats,
    };

    return [
      { label: 'Problems Solved', value: Number(source.problemsSolved) || 0, suffix: '' },
      { label: 'Current Streak', value: Number(source.currentStreak) || 0, suffix: ' days 🔥' },
      { label: 'AI Hints Used', value: Number(source.aiHintsUsed) || 0, suffix: '' },
      { label: 'Accuracy', value: Number(source.accuracy) || 0, suffix: '%' },
    ];
  }, [stats]);

  const activityItems = recentActivity?.length ? recentActivity.slice(0, 3) : defaultRecentActivity;

  const [typedText, setTypedText] = useState('');
  const [countValues, setCountValues] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const greeting = `Hey ${username} 👋 Ready to grind?`;
    let index = 0;
    setTypedText('');

    const typeTimer = window.setInterval(() => {
      index += 1;
      setTypedText(greeting.slice(0, index));

      if (index >= greeting.length) {
        window.clearInterval(typeTimer);
      }
    }, 52);

    return () => window.clearInterval(typeTimer);
  }, [username]);

  useEffect(() => {
    const durations = 900;
    const frameMs = 16;
    const startTime = performance.now();
    const targets = mergedStats.map((item) => item.value);

    const animate = (now) => {
      const progress = Math.min((now - startTime) / durations, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCountValues(targets.map((target) => Math.round(target * eased)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const raf = requestAnimationFrame(animate);
    const fallback = window.setTimeout(() => {
      setCountValues(targets);
    }, durations + frameMs);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
    };
  }, [mergedStats]);

  return (
    <main style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes dashboardFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.03); }
        }

        @keyframes pulseSoft {
          0%, 100% { box-shadow: 0 14px 32px rgba(0, 0, 0, 0.24); }
          50% { box-shadow: 0 18px 42px rgba(108, 99, 255, 0.22); }
        }

        @keyframes cursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        .dashboard-stat:hover {
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 18px 44px rgba(108, 99, 255, 0.18), 0 0 0 1px rgba(0, 245, 160, 0.24);
          border-color: rgba(0, 245, 160, 0.35);
        }

        .dashboard-stat:hover::before {
          opacity: 1;
        }

        .dashboard-stat::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(108, 99, 255, 0.55), rgba(0, 245, 160, 0.55), rgba(108, 99, 255, 0.05));
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 220ms ease;
          pointer-events: none;
        }

        .dashboard-action:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 30px rgba(108, 99, 255, 0.22);
        }

        .dashboard-action:focus-visible,
        .dashboard-stat:focus-visible {
          outline: 2px solid #00F5A0;
          outline-offset: 3px;
        }

        .progress-sheen {
          animation: shimmer 2.2s linear infinite;
        }

        @keyframes shimmer {
          from { transform: translateX(-120%); }
          to { transform: translateX(180%); }
        }

        @media (max-width: 980px) {
          .dashboard-top,
          .stats-row,
          .quick-actions,
          .dashboard-layout,
          .recent-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .dashboard-page {
            padding: 18px 14px 28px !important;
          }

          .dashboard-stat {
            min-height: 148px !important;
          }

          .dashboard-action {
            width: 100%;
          }
        }
      `}</style>

      <div style={styles.shell}>
        <section style={{ ...styles.card, ...styles.header }} className="dashboard-top">
          <div style={styles.heroCard}>
            <p style={styles.eyebrow}>AlgoCoach Dashboard</p>
            <h1 style={styles.title}>
              {typedText}
              <span style={styles.typingCursor}>|</span>
            </h1>
            <p style={styles.typingLine}>
              Your smart interview grind zone for coding reps, AI-guided hints, timed mock prep, and a clean progress view.
            </p>
          </div>

          <div style={styles.heroMeta}>
            <div style={styles.badge}>Smart Coding Interview Coach</div>
            <div style={styles.badge}>{username}</div>
          </div>
        </section>

        <section style={styles.statsGrid} className="stats-row">
          {mergedStats.map((item, index) => (
            <article
              key={item.label}
              className="dashboard-stat"
              style={{
                ...styles.statCard,
                animation: `floatCard 5.5s ease-in-out infinite`,
                animationDelay: `${index * 180}ms`,
              }}
            >
              <div style={styles.floatingOrb} aria-hidden="true" />
              <div>
                <p style={styles.statLabel}>{item.label}</p>
                <h2 style={styles.statValue}>
                  {countValues[index]}
                  <span style={styles.statSuffix}>{item.suffix}</span>
                </h2>
              </div>
              <p style={styles.statHelper}>Animated counter with live momentum.</p>
            </article>
          ))}
        </section>

        <section style={{ ...styles.card, marginTop: '18px' }}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={{ ...styles.actionRow, marginTop: '16px' }} className="quick-actions">
            <a href="/problems" className="dashboard-action" style={{ ...styles.actionButton }}>
              Start Coding 🚀
            </a>
            <a href="/daily" className="dashboard-action" style={{ ...styles.actionButton, ...styles.actionButtonAlt }}>
              Daily Challenge ⚡
            </a>
            <a href="/mock" className="dashboard-action" style={{ ...styles.actionButton, ...styles.actionButtonThird }}>
              Mock Interview 🎯
            </a>
          </div>
        </section>

        <section style={{ ...styles.card, ...styles.sectionCard }}>
          <h2 style={styles.sectionTitle}>Recent Activity</h2>
          <div style={styles.recentGrid} className="recent-grid">
            {activityItems.map((item, index) => (
              <article key={`${item.title}-${index}`} style={styles.recentItem}>
                <h3 style={styles.recentTitle}>{item.title}</h3>
                <p style={styles.recentMeta}>{item.meta || item.description || 'Recent attempt'}</p>
                <span style={styles.recentStatus}>{item.status || 'Attempted'}</span>
              </article>
            ))}
          </div>
        </section>

        <section style={{ ...styles.card, ...styles.sectionCard }}>
          <h2 style={styles.sectionTitle}>Topic Progress</h2>
          <div style={styles.topicsWrap}>
            {(stats.topics || topicDefaults).map((item, index) => (
              <div key={item.topic} style={styles.topicRow}>
                <div style={styles.topicHeader}>
                  <p style={styles.topicLabel}>{item.topic}</p>
                  <span style={styles.topicPercent}>{item.progress}%</span>
                </div>
                <div style={styles.progressTrack}>
                  <div
                    className="progress-sheen"
                    style={{
                      ...styles.progressFill,
                      width: `${Math.max(0, Math.min(item.progress, 100))}%`,
                      animationDelay: `${index * 120}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
