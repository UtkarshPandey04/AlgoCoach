import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';

const defaultData = {
  user: { role: 'admin', name: 'Admin User' },
  kpis: {
    totalStudents: 1280,
    activeToday: 346,
    avgScore: 78,
    totalSubmissions: 19840,
  },
  submissionsPerDay: [120, 145, 132, 190, 214, 240, 206],
  difficultyDistribution: {
    easy: 45,
    medium: 38,
    hard: 17,
  },
  topStudents: [
    { id: '1', name: 'Aarav Mehta', email: 'aarav@example.com', batch: '2026', solved: 340, score: 94 },
    { id: '2', name: 'Riya Shah', email: 'riya@example.com', batch: '2025', solved: 322, score: 92 },
    { id: '3', name: 'Kunal Jain', email: 'kunal@example.com', batch: '2026', solved: 309, score: 91 },
    { id: '4', name: 'Neha Verma', email: 'neha@example.com', batch: '2027', solved: 295, score: 89 },
    { id: '5', name: 'Manav Singh', email: 'manav@example.com', batch: '2025', solved: 281, score: 88 },
  ],
  recentActivity: [
    { id: 'a1', text: 'Riya solved Graph Valid Tree', time: '2m ago' },
    { id: 'a2', text: 'New problem added: Maximum Subarray', time: '11m ago' },
    { id: 'a3', text: 'Batch 2026 weekly report generated', time: '40m ago' },
    { id: 'a4', text: 'Kunal reached 300 solved problems', time: '1h ago' },
  ],
  students: [
    {
      id: 's1',
      name: 'Aarav Mehta',
      email: 'aarav@example.com',
      batch: '2026',
      college: 'IIT Delhi',
      problemsSolved: 340,
      lastActive: '5m ago',
    },
    {
      id: 's2',
      name: 'Riya Shah',
      email: 'riya@example.com',
      batch: '2025',
      college: 'NIT Trichy',
      problemsSolved: 322,
      lastActive: '9m ago',
    },
    {
      id: 's3',
      name: 'Kunal Jain',
      email: 'kunal@example.com',
      batch: '2026',
      college: 'BITS Pilani',
      problemsSolved: 309,
      lastActive: '18m ago',
    },
  ],
  problems: [
    { id: 'p1', title: 'Two Sum', topic: 'Arrays', difficulty: 'Easy' },
    { id: 'p2', title: 'Course Schedule', topic: 'Graphs', difficulty: 'Medium' },
    { id: 'p3', title: 'Merge K Sorted Lists', topic: 'Heap', difficulty: 'Hard' },
  ],
};

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at 5% 5%, rgba(108, 99, 255, 0.22), transparent 25%), radial-gradient(circle at 90% 10%, rgba(0, 245, 160, 0.1), transparent 25%), #0D0D0D',
    color: '#F4F5FF',
    fontFamily: 'Inter, Poppins, sans-serif',
    padding: '16px',
  },
  layout: {
    width: 'min(1400px, 100%)',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '250px minmax(0, 1fr)',
    gap: '16px',
  },
  sidebar: {
    border: '1px solid rgba(108, 99, 255, 0.35)',
    borderRadius: '16px',
    background: 'rgba(22, 22, 36, 0.84)',
    backdropFilter: 'blur(14px)',
    padding: '16px',
    height: 'calc(100vh - 32px)',
    position: 'sticky',
    top: '16px',
    display: 'grid',
    alignContent: 'start',
    gap: '10px',
  },
  brand: {
    margin: 0,
    fontWeight: 800,
    fontSize: '1.2rem',
    backgroundImage: 'linear-gradient(90deg, #6C63FF, #00F5A0)',
    color: 'transparent',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
  },
  link: {
    width: '100%',
    textAlign: 'left',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    color: '#EAEAFF',
    padding: '11px 12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 180ms ease',
  },
  main: {
    display: 'grid',
    gap: '16px',
  },
  card: {
    border: '1px solid rgba(108, 99, 255, 0.32)',
    borderRadius: '16px',
    background: 'rgba(26, 26, 46, 0.8)',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 16px 36px rgba(0,0,0,0.32)',
  },
  headerCard: {
    padding: '18px',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
    letterSpacing: '-0.03em',
  },
  subtitle: {
    margin: '8px 0 0',
    color: 'rgba(255,255,255,0.72)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
  },
  kpiCard: {
    padding: '14px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  kpiLabel: {
    margin: 0,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    color: 'rgba(255,255,255,0.68)',
    fontWeight: 700,
  },
  kpiValue: {
    margin: '8px 0 0',
    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
    letterSpacing: '-0.04em',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 0.75fr',
    gap: '12px',
  },
  chartCard: {
    padding: '14px',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '0.95rem',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: '#CFCBFF',
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
    color: 'rgba(255,255,255,0.68)',
    padding: '6px 10px',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tr: {
    background: 'rgba(255,255,255,0.04)',
    animation: 'rowFadeIn 420ms ease both',
  },
  td: {
    padding: '10px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontSize: '0.92rem',
  },
  split: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  feedList: {
    marginTop: '10px',
    display: 'grid',
    gap: '8px',
  },
  feedItem: {
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '10px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
  },
  controlsRow: {
    marginTop: '10px',
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  input: {
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    borderRadius: '10px',
    padding: '9px 10px',
    minWidth: '180px',
  },
  actionBtn: {
    border: '1px solid rgba(0,245,160,0.4)',
    borderRadius: '10px',
    background: 'rgba(0,245,160,0.12)',
    color: '#00F5A0',
    padding: '8px 12px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  textBtn: {
    border: '1px solid rgba(255,255,255,0.16)',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    padding: '6px 10px',
    cursor: 'pointer',
  },
};

function useCountUp(target, duration = 850) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

function AdminDashboard({ adminData }) {
  const data = { ...defaultData, ...(adminData || {}) };

  if ((data.user?.role || '').toLowerCase() !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const [tab, setTab] = useState('Overview');
  const [studentQuery, setStudentQuery] = useState('');
  const [batchFilter, setBatchFilter] = useState('All');
  const [collegeFilter, setCollegeFilter] = useState('All');

  const totalStudents = useCountUp(Number(data.kpis?.totalStudents) || 0);
  const activeToday = useCountUp(Number(data.kpis?.activeToday) || 0);
  const avgScore = useCountUp(Number(data.kpis?.avgScore) || 0);
  const totalSubmissions = useCountUp(Number(data.kpis?.totalSubmissions) || 0);

  const submissions = data.submissionsPerDay || defaultData.submissionsPerDay;
  const maxSub = Math.max(...submissions, 1);

  const pie = data.difficultyDistribution || defaultData.difficultyDistribution;
  const easy = Number(pie.easy) || 0;
  const medium = Number(pie.medium) || 0;
  const hard = Number(pie.hard) || 0;
  const totalPie = Math.max(easy + medium + hard, 1);

  const pieRadius = 58;
  const pieCirc = 2 * Math.PI * pieRadius;
  const easyLen = (easy / totalPie) * pieCirc;
  const medLen = (medium / totalPie) * pieCirc;
  const hardLen = (hard / totalPie) * pieCirc;

  const students = data.students || [];
  const batchOptions = ['All', ...Array.from(new Set(students.map((s) => s.batch).filter(Boolean)))];
  const collegeOptions = ['All', ...Array.from(new Set(students.map((s) => s.college).filter(Boolean)))];

  const filteredStudents = students.filter((student) => {
    const queryMatch = (student.name || '').toLowerCase().includes(studentQuery.toLowerCase()) ||
      (student.email || '').toLowerCase().includes(studentQuery.toLowerCase());
    const batchMatch = batchFilter === 'All' || student.batch === batchFilter;
    const collegeMatch = collegeFilter === 'All' || student.college === collegeFilter;
    return queryMatch && batchMatch && collegeMatch;
  });

  const sidebarLinks = ['Overview', 'Students', 'Problems', 'Reports', 'Settings'];

  return (
    <main style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Poppins:wght@400;500;700;800&display=swap');

        @keyframes barGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }

        @keyframes rowFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .side-link.active {
          border-color: rgba(108, 99, 255, 0.65);
          box-shadow: 0 0 18px rgba(108, 99, 255, 0.25);
          background: rgba(108, 99, 255, 0.2);
        }

        .side-link:hover {
          border-color: rgba(108, 99, 255, 0.45);
          transform: translateY(-1px);
        }

        @media (max-width: 1080px) {
          .admin-layout {
            grid-template-columns: 1fr !important;
          }

          .admin-sidebar {
            height: auto !important;
            position: static !important;
          }

          .admin-kpis {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .admin-charts,
          .admin-split {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .admin-kpis {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.layout} className="admin-layout">
        <aside style={styles.sidebar} className="admin-sidebar">
          <h2 style={styles.brand}>AlgoCoach Admin</h2>
          {sidebarLinks.map((label) => (
            <button
              key={label}
              type="button"
              style={styles.link}
              className={`side-link ${tab === label ? 'active' : ''}`}
              onClick={() => setTab(label)}
            >
              {label}
            </button>
          ))}
        </aside>

        <section style={styles.main}>
          <header style={{ ...styles.card, ...styles.headerCard }}>
            <h1 style={styles.title}>{tab}</h1>
            <p style={styles.subtitle}>Data-driven control center for student performance and platform health.</p>
          </header>

          {tab === 'Overview' ? (
            <>
              <section style={styles.kpiGrid} className="admin-kpis">
                {[
                  { label: 'Total Students', value: totalStudents },
                  { label: 'Active Today', value: activeToday },
                  { label: 'Avg Score', value: avgScore, suffix: '%' },
                  { label: 'Total Submissions', value: totalSubmissions },
                ].map((kpi) => (
                  <article key={kpi.label} style={{ ...styles.card, ...styles.kpiCard }}>
                    <p style={styles.kpiLabel}>{kpi.label}</p>
                    <h2 style={styles.kpiValue}>
                      {kpi.value}
                      {kpi.suffix || ''}
                    </h2>
                  </article>
                ))}
              </section>

              <section style={styles.chartGrid} className="admin-charts">
                <article style={{ ...styles.card, ...styles.chartCard }}>
                  <h3 style={styles.sectionTitle}>Submissions Per Day (Last 7 Days)</h3>
                  <svg width="100%" height="250" viewBox="0 0 700 250" preserveAspectRatio="none" style={{ marginTop: '10px' }}>
                    {submissions.map((value, index) => {
                      const barWidth = 72;
                      const gap = 22;
                      const x = 24 + index * (barWidth + gap);
                      const h = Math.max(10, (value / maxSub) * 170);
                      const y = 220 - h;

                      return (
                        <g key={`bar-${index}`}>
                          <rect x={x} y={y} width={barWidth} height={h} fill="url(#barGradient)" rx="10" style={{ transformOrigin: `${x + barWidth / 2}px 220px`, animation: `barGrow 650ms ease both`, animationDelay: `${index * 80}ms` }} />
                          <text x={x + barWidth / 2} y={236} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="12">
                            D{index + 1}
                          </text>
                        </g>
                      );
                    })}
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00F5A0" />
                        <stop offset="100%" stopColor="#6C63FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                </article>

                <article style={{ ...styles.card, ...styles.chartCard }}>
                  <h3 style={styles.sectionTitle}>Easy / Medium / Hard Distribution</h3>
                  <div style={{ display: 'grid', placeItems: 'center', marginTop: '12px' }}>
                    <svg width="220" height="220" viewBox="0 0 220 220" aria-label="Pie chart">
                      <g transform="translate(110,110)">
                        <circle r={pieRadius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="18" />
                        <circle
                          r={pieRadius}
                          fill="none"
                          stroke="#00F5A0"
                          strokeWidth="18"
                          strokeDasharray={`${easyLen} ${pieCirc}`}
                          strokeDashoffset={0}
                          transform="rotate(-90)"
                        />
                        <circle
                          r={pieRadius}
                          fill="none"
                          stroke="#FFB347"
                          strokeWidth="18"
                          strokeDasharray={`${medLen} ${pieCirc}`}
                          strokeDashoffset={-easyLen}
                          transform="rotate(-90)"
                        />
                        <circle
                          r={pieRadius}
                          fill="none"
                          stroke="#FF6B6B"
                          strokeWidth="18"
                          strokeDasharray={`${hardLen} ${pieCirc}`}
                          strokeDashoffset={-(easyLen + medLen)}
                          transform="rotate(-90)"
                        />
                      </g>
                    </svg>
                    <div style={{ width: '100%', display: 'grid', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Easy</span><strong>{easy}%</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Medium</span><strong>{medium}%</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Hard</span><strong>{hard}%</strong></div>
                    </div>
                  </div>
                </article>
              </section>

              <section style={styles.split} className="admin-split">
                <article style={{ ...styles.card, ...styles.tableCard }}>
                  <h3 style={styles.sectionTitle}>Top 5 Students</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Rank</th>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Batch</th>
                        <th style={styles.th}>Solved</th>
                        <th style={styles.th}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.topStudents || []).slice(0, 5).map((student, index) => (
                        <tr key={student.id || index} style={{ ...styles.tr, animationDelay: `${index * 70}ms` }}>
                          <td style={styles.td}>#{index + 1}</td>
                          <td style={styles.td}>{student.name}</td>
                          <td style={styles.td}>{student.email}</td>
                          <td style={styles.td}>{student.batch}</td>
                          <td style={styles.td}>{student.solved}</td>
                          <td style={styles.td}>{student.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </article>

                <article style={{ ...styles.card, ...styles.chartCard }}>
                  <h3 style={styles.sectionTitle}>Recent Activity Feed</h3>
                  <div style={styles.feedList}>
                    {(data.recentActivity || []).map((item) => (
                      <div key={item.id} style={styles.feedItem}>
                        <span>{item.text}</span>
                        <small style={{ color: 'rgba(255,255,255,0.62)' }}>{item.time}</small>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </>
          ) : null}

          {tab === 'Students' ? (
            <article style={{ ...styles.card, ...styles.tableCard }}>
              <h3 style={styles.sectionTitle}>Students</h3>
              <div style={styles.controlsRow}>
                <input style={styles.input} placeholder="Search by name or email" value={studentQuery} onChange={(event) => setStudentQuery(event.target.value)} />
                <select style={styles.input} value={batchFilter} onChange={(event) => setBatchFilter(event.target.value)}>
                  {batchOptions.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
                <select style={styles.input} value={collegeFilter} onChange={(event) => setCollegeFilter(event.target.value)}>
                  {collegeOptions.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>

              <table style={{ ...styles.table, marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Batch</th>
                    <th style={styles.th}>College</th>
                    <th style={styles.th}>Problems Solved</th>
                    <th style={styles.th}>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student.id || index} style={{ ...styles.tr, animationDelay: `${index * 70}ms` }}>
                      <td style={styles.td}>{student.name}</td>
                      <td style={styles.td}>{student.email}</td>
                      <td style={styles.td}>{student.batch}</td>
                      <td style={styles.td}>{student.college}</td>
                      <td style={styles.td}>{student.problemsSolved}</td>
                      <td style={styles.td}>{student.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ) : null}

          {tab === 'Problems' ? (
            <article style={{ ...styles.card, ...styles.tableCard }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                <h3 style={styles.sectionTitle}>Problems</h3>
                <button type="button" style={styles.actionBtn}>+ Add New Problem</button>
              </div>

              <table style={{ ...styles.table, marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Topic</th>
                    <th style={styles.th}>Difficulty</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.problems || []).map((problem, index) => (
                    <tr key={problem.id || index} style={{ ...styles.tr, animationDelay: `${index * 70}ms` }}>
                      <td style={styles.td}>{problem.title}</td>
                      <td style={styles.td}>{problem.topic}</td>
                      <td style={styles.td}>{problem.difficulty}</td>
                      <td style={styles.td}>
                        <button type="button" style={styles.textBtn}>Edit</button>
                        <button type="button" style={{ ...styles.textBtn, marginLeft: '8px' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          ) : null}

          {tab === 'Reports' ? (
            <article style={{ ...styles.card, ...styles.headerCard }}>
              <h3 style={styles.sectionTitle}>Reports</h3>
              <p style={styles.subtitle}>Generate weekly and monthly analytics from this section.</p>
            </article>
          ) : null}

          {tab === 'Settings' ? (
            <article style={{ ...styles.card, ...styles.headerCard }}>
              <h3 style={styles.sectionTitle}>Settings</h3>
              <p style={styles.subtitle}>Configure admin preferences, access control, and notifications.</p>
            </article>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
