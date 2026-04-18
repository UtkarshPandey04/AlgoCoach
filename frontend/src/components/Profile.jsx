import { useEffect, useMemo, useState } from 'react';

const defaultUser = {
  id: 'u1',
  name: 'Utkarsh Pandey',
  college: 'NIT Example',
  batch: '2026',
  avatar: '',
};

const defaultStats = {
  solved: 142,
  streak: 12,
  rank: 58,
  accuracy: 84,
  topicProgress: {
    Arrays: 88,
    Trees: 72,
    DP: 64,
    Graphs: 69,
    Strings: 81,
  },
  difficultyBreakdown: {
    easy: 62,
    medium: 56,
    hard: 24,
  },
  heatmap: [],
};

const defaultBadges = ['First Solve 🎯', '7 Day Streak 🔥', 'AI Free Solve 💪', 'Speed Coder ⚡', 'Bug Hunter 🧠'];

const defaultSubmissions = [
  { id: 's1', problem: 'Two Sum', topic: 'Arrays', status: 'Accepted', runtime: '18 ms', submittedAt: '2h ago' },
  {
    id: 's2',
    problem: 'Binary Tree Zigzag Level Order',
    topic: 'Trees',
    status: 'Accepted',
    runtime: '42 ms',
    submittedAt: '5h ago',
  },
  {
    id: 's3',
    problem: 'Coin Change',
    topic: 'DP',
    status: 'Wrong Answer',
    runtime: 'N/A',
    submittedAt: '1d ago',
  },
  {
    id: 's4',
    problem: 'Number of Islands',
    topic: 'Graphs',
    status: 'Accepted',
    runtime: '37 ms',
    submittedAt: '2d ago',
  },
];

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at 15% 10%, rgba(108, 99, 255, 0.24), transparent 24%), radial-gradient(circle at 80% 12%, rgba(0, 245, 160, 0.1), transparent 20%), #0D0D0D',
    color: '#F6F7FF',
    fontFamily: 'Inter, Poppins, sans-serif',
    padding: '24px 16px 32px',
  },
  shell: {
    width: 'min(1200px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gap: '16px',
  },
  card: {
    background: 'rgba(26, 26, 46, 0.78)',
    border: '1px solid rgba(108, 99, 255, 0.35)',
    borderRadius: '18px',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 16px 36px rgba(0, 0, 0, 0.35)',
  },
  hero: {
    padding: '0',
    overflow: 'hidden',
  },
  heroBanner: {
    height: '140px',
    background: 'linear-gradient(135deg, #6C63FF 0%, #00F5A0 100%)',
    opacity: 0.85,
  },
  heroContent: {
    padding: '0 20px 20px',
    marginTop: '-48px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  avatarWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '14px',
  },
  avatar: {
    width: '94px',
    height: '94px',
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.86)',
    background: 'linear-gradient(135deg, rgba(108,99,255,0.95), rgba(0,245,160,0.82))',
    color: '#0D0D0D',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 800,
    fontSize: '1.6rem',
    boxShadow: '0 0 24px rgba(108, 99, 255, 0.45)',
    animation: 'avatarIn 760ms cubic-bezier(0.22, 1, 0.36, 1) both, avatarGlow 2.2s ease-in-out infinite',
  },
  name: {
    margin: 0,
    fontSize: 'clamp(1.35rem, 3vw, 2rem)',
    letterSpacing: '-0.03em',
  },
  meta: {
    margin: '6px 0 0',
    color: 'rgba(255,255,255,0.76)',
    fontSize: '0.94rem',
  },
  editBtn: {
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(13,13,13,0.45)',
    color: '#fff',
    borderRadius: '12px',
    padding: '10px 14px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
  },
  statCard: {
    padding: '16px',
    borderRadius: '14px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    animation: 'cardRise 500ms ease both',
  },
  statLabel: {
    margin: 0,
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.82rem',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    fontWeight: 700,
  },
  statValue: {
    margin: '10px 0 0',
    fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
    letterSpacing: '-0.05em',
  },
  split: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: '16px',
  },
  sectionCard: {
    padding: '16px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1rem',
    color: '#CFCBFF',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  skillList: {
    marginTop: '14px',
    display: 'grid',
    gap: '12px',
  },
  skillHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
    fontSize: '0.9rem',
  },
  skillTrack: {
    width: '100%',
    height: '12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, #6C63FF 0%, #00F5A0 100%)',
    boxShadow: '0 0 16px rgba(0,245,160,0.24)',
    transition: 'width 900ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  donutWrap: {
    marginTop: '12px',
    display: 'grid',
    placeItems: 'center',
    gap: '12px',
  },
  legend: {
    width: '100%',
    display: 'grid',
    gap: '8px',
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '8px',
  },
  heatmapCard: {
    padding: '16px',
  },
  heatmapGrid: {
    marginTop: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(14, 1fr)',
    gap: '4px',
  },
  heatCell: {
    width: '100%',
    aspectRatio: '1 / 1',
    borderRadius: '3px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  badgesGrid: {
    marginTop: '12px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '10px',
  },
  badge: {
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    padding: '12px',
    fontWeight: 700,
    fontSize: '0.9rem',
    animation: 'badgePop 560ms cubic-bezier(0.22, 1, 0.36, 1) both',
  },
  tableCard: {
    padding: '14px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    minWidth: '760px',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
  },
  th: {
    textAlign: 'left',
    color: 'rgba(255,255,255,0.72)',
    fontSize: '0.82rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '6px 10px',
  },
  tr: {
    background: 'rgba(255,255,255,0.04)',
  },
  td: {
    padding: '11px 10px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontSize: '0.92rem',
  },
  status: {
    borderRadius: '999px',
    padding: '5px 10px',
    fontSize: '0.76rem',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
  },
};

function createHeatmapData(input) {
  if (Array.isArray(input) && input.length) {
    return input.slice(0, 84).map((v) => Math.max(0, Math.min(4, Number(v) || 0)));
  }

  return Array.from({ length: 84 }, (_, idx) => {
    const wave = Math.sin(idx * 0.32) * 2 + 2;
    return Math.max(0, Math.min(4, Math.round(wave)));
  });
}

function useCountUp(target, duration = 850) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();

    const animate = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function Profile({ user, stats, submissions, badges }) {
  const profileUser = user || defaultUser;
  const mergedStats = { ...defaultStats, ...(stats || {}) };
  const activity = Array.isArray(submissions) && submissions.length ? submissions : defaultSubmissions;
  const badgeList = Array.isArray(badges) && badges.length ? badges : defaultBadges;
  const heatmap = createHeatmapData(mergedStats.heatmap);

  const solvedCount = useCountUp(Number(mergedStats.solved) || 0);
  const streakCount = useCountUp(Number(mergedStats.streak) || 0);
  const rankCount = useCountUp(Number(mergedStats.rank) || 0);
  const accuracyCount = useCountUp(Number(mergedStats.accuracy) || 0);

  const [showBars, setShowBars] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShowBars(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  const initials = useMemo(() => {
    const name = profileUser?.name || 'User';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [profileUser]);

  const topicProgress = mergedStats.topicProgress || defaultStats.topicProgress;
  const easy = Number(mergedStats.difficultyBreakdown?.easy) || 0;
  const medium = Number(mergedStats.difficultyBreakdown?.medium) || 0;
  const hard = Number(mergedStats.difficultyBreakdown?.hard) || 0;
  const total = Math.max(easy + medium + hard, 1);

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const easyStroke = (easy / total) * circumference;
  const mediumStroke = (medium / total) * circumference;
  const hardStroke = (hard / total) * circumference;

  const strokeGap = 6;

  return (
    <main style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Poppins:wght@400;500;700;800&display=swap');

        @keyframes avatarIn {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes avatarGlow {
          0%, 100% { box-shadow: 0 0 16px rgba(108, 99, 255, 0.35); }
          50% { box-shadow: 0 0 24px rgba(0, 245, 160, 0.4); }
        }

        @keyframes cardRise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes badgePop {
          0% { opacity: 0; transform: scale(0.75); }
          60% { opacity: 1; transform: scale(1.06); }
          100% { transform: scale(1); }
        }

        @media (max-width: 980px) {
          .profile-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .profile-split {
            grid-template-columns: 1fr !important;
          }

          .profile-badges {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 640px) {
          .profile-stats {
            grid-template-columns: 1fr !important;
          }

          .profile-badges {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.shell}>
        <section style={{ ...styles.card, ...styles.hero }}>
          <div style={styles.heroBanner} />
          <div style={styles.heroContent}>
            <div style={styles.avatarWrap}>
              <div style={styles.avatar}>{profileUser.avatar ? <img src={profileUser.avatar} alt="avatar" /> : initials}</div>
              <div>
                <h1 style={styles.name}>{profileUser.name || 'User'}</h1>
                <p style={styles.meta}>{profileUser.college || 'College'} · Batch {profileUser.batch || 'N/A'}</p>
              </div>
            </div>

            <button type="button" style={styles.editBtn}>
              Edit Profile
            </button>
          </div>
        </section>

        <section style={styles.statsGrid} className="profile-stats">
          {[
            { label: 'Solved', value: solvedCount },
            { label: 'Streak', value: streakCount, suffix: ' 🔥' },
            { label: 'Rank', value: rankCount, prefix: '#' },
            { label: 'Accuracy', value: accuracyCount, suffix: '%' },
          ].map((item, index) => (
            <article key={item.label} style={{ ...styles.card, ...styles.statCard, animationDelay: `${index * 90}ms` }}>
              <p style={styles.statLabel}>{item.label}</p>
              <h2 style={styles.statValue}>
                {item.prefix || ''}
                {item.value}
                {item.suffix || ''}
              </h2>
            </article>
          ))}
        </section>

        <section style={styles.split} className="profile-split">
          <div style={{ display: 'grid', gap: '16px' }}>
            <article style={{ ...styles.card, ...styles.sectionCard }}>
              <h3 style={styles.sectionTitle}>Topic-Wise Progress</h3>
              <div style={styles.skillList}>
                {Object.entries(topicProgress).map(([topic, value]) => (
                  <div key={topic}>
                    <div style={styles.skillHead}>
                      <span>{topic}</span>
                      <span>{value}%</span>
                    </div>
                    <div style={styles.skillTrack}>
                      <div style={{ ...styles.skillFill, width: showBars ? `${value}%` : '0%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article style={{ ...styles.card, ...styles.heatmapCard }}>
              <h3 style={styles.sectionTitle}>Activity Heatmap</h3>
              <div style={styles.heatmapGrid}>
                {heatmap.map((level, index) => {
                  const opacity = [0.08, 0.2, 0.38, 0.62, 0.9][level] || 0.08;
                  return (
                    <span
                      key={`heat-${index}`}
                      title={`Activity level ${level}`}
                      style={{
                        ...styles.heatCell,
                        background: `rgba(0, 245, 160, ${opacity})`,
                      }}
                    />
                  );
                })}
              </div>
            </article>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            <article style={{ ...styles.card, ...styles.sectionCard }}>
              <h3 style={styles.sectionTitle}>Solved Breakdown</h3>
              <div style={styles.donutWrap}>
                <svg width="180" height="180" viewBox="0 0 180 180" aria-label="Solved breakdown donut chart">
                  <g transform="translate(90,90)">
                    <circle r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="14" />

                    <circle
                      r={radius}
                      fill="none"
                      stroke="#00F5A0"
                      strokeWidth="14"
                      strokeDasharray={`${Math.max(0, easyStroke - strokeGap)} ${circumference}`}
                      strokeDashoffset={0}
                      transform="rotate(-90)"
                      strokeLinecap="round"
                    />
                    <circle
                      r={radius}
                      fill="none"
                      stroke="#FFB347"
                      strokeWidth="14"
                      strokeDasharray={`${Math.max(0, mediumStroke - strokeGap)} ${circumference}`}
                      strokeDashoffset={-(easyStroke || 0)}
                      transform="rotate(-90)"
                      strokeLinecap="round"
                    />
                    <circle
                      r={radius}
                      fill="none"
                      stroke="#FF6B6B"
                      strokeWidth="14"
                      strokeDasharray={`${Math.max(0, hardStroke - strokeGap)} ${circumference}`}
                      strokeDashoffset={-((easyStroke || 0) + (mediumStroke || 0))}
                      transform="rotate(-90)"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>

                <div style={styles.legend}>
                  <div style={styles.legendRow}>
                    <span><span style={{ ...styles.dot, background: '#00F5A0' }} />Easy</span>
                    <strong>{easy}</strong>
                  </div>
                  <div style={styles.legendRow}>
                    <span><span style={{ ...styles.dot, background: '#FFB347' }} />Medium</span>
                    <strong>{medium}</strong>
                  </div>
                  <div style={styles.legendRow}>
                    <span><span style={{ ...styles.dot, background: '#FF6B6B' }} />Hard</span>
                    <strong>{hard}</strong>
                  </div>
                </div>
              </div>
            </article>

            <article style={{ ...styles.card, ...styles.sectionCard }}>
              <h3 style={styles.sectionTitle}>Achievement Badges</h3>
              <div style={styles.badgesGrid} className="profile-badges">
                {badgeList.map((badge, index) => (
                  <div key={badge} style={{ ...styles.badge, animationDelay: `${index * 80}ms` }}>
                    {badge}
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section style={{ ...styles.card, ...styles.tableCard }}>
          <h3 style={styles.sectionTitle}>Recent Submissions</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Problem</th>
                <th style={styles.th}>Topic</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Runtime</th>
                <th style={styles.th}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((submission) => {
                const accepted = `${submission.status}`.toLowerCase().includes('accepted');

                return (
                  <tr key={submission.id} style={styles.tr}>
                    <td style={styles.td}>{submission.problem}</td>
                    <td style={styles.td}>{submission.topic}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.status,
                          color: accepted ? '#00F5A0' : '#FF6B6B',
                          background: accepted ? 'rgba(0,245,160,0.12)' : 'rgba(255,107,107,0.12)',
                          border: `1px solid ${accepted ? 'rgba(0,245,160,0.42)' : 'rgba(255,107,107,0.42)'}`,
                        }}
                      >
                        {submission.status}
                      </span>
                    </td>
                    <td style={styles.td}>{submission.runtime}</td>
                    <td style={styles.td}>{submission.submittedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

export default Profile;
