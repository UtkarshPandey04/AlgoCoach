import { useMemo, useState } from 'react';

const difficultyColor = {
  easy: '#00F5A0',
  medium: '#FFB347',
  hard: '#FF6B6B',
};

const sampleProblems = [
  {
    id: '1',
    title: 'Two Sum',
    topic: 'Arrays',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google'],
    solved: true,
    slug: 'two-sum',
  },
  {
    id: '2',
    title: 'Longest Substring Without Repeating Characters',
    topic: 'Strings',
    difficulty: 'Medium',
    companies: ['Adobe', 'Uber'],
    solved: false,
    slug: 'longest-substring-without-repeating-characters',
  },
  {
    id: '3',
    title: 'Serialize and Deserialize Binary Tree',
    topic: 'Trees',
    difficulty: 'Hard',
    companies: ['Meta', 'Microsoft'],
    solved: false,
    slug: 'serialize-and-deserialize-binary-tree',
  },
];

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top left, rgba(108, 99, 255, 0.2), transparent 22%), radial-gradient(circle at top right, rgba(0, 245, 160, 0.1), transparent 20%), linear-gradient(180deg, #0D0D0D 0%, #11111B 100%)',
    color: '#fff',
    fontFamily: 'Inter, Poppins, sans-serif',
    padding: '30px 18px 40px',
  },
  shell: {
    width: 'min(1200px, 100%)',
    margin: '0 auto',
  },
  card: {
    background: 'rgba(26, 26, 46, 0.72)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: '20px',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 16px 50px rgba(0,0,0,0.35)',
  },
  header: {
    padding: '22px',
    animation: 'problemsFadeIn 700ms ease both',
  },
  heading: {
    margin: 0,
    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
    letterSpacing: '-0.04em',
  },
  subtitle: {
    margin: '8px 0 0',
    color: 'rgba(255,255,255,0.74)',
    fontSize: '1rem',
  },
  controlsCard: {
    marginTop: '14px',
    padding: '18px',
  },
  search: {
    width: '100%',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    padding: '12px 14px',
    outline: 'none',
    transition: 'box-shadow 180ms ease, border-color 180ms ease',
  },
  filtersRow: {
    marginTop: '12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
  },
  filterButton: {
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '999px',
    padding: '9px 14px',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
  },
  topicSelect: {
    marginLeft: 'auto',
    minWidth: '170px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '9px 10px',
    color: '#fff',
    background: 'rgba(255,255,255,0.06)',
    outline: 'none',
  },
  tableCard: {
    marginTop: '14px',
    padding: '10px',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 8px',
    minWidth: '930px',
  },
  th: {
    textAlign: 'left',
    color: 'rgba(255,255,255,0.68)',
    fontSize: '0.84rem',
    fontWeight: 700,
    padding: '8px 12px',
    whiteSpace: 'nowrap',
  },
  tr: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    overflow: 'hidden',
    transition: 'transform 180ms ease, box-shadow 180ms ease',
    animationName: 'rowFadeIn',
    animationDuration: '500ms',
    animationTimingFunction: 'ease',
    animationFillMode: 'both',
  },
  td: {
    padding: '14px 12px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    verticalAlign: 'middle',
  },
  titleLink: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 700,
  },
  topicPill: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: '999px',
    background: 'rgba(108, 99, 255, 0.2)',
    border: '1px solid rgba(108, 99, 255, 0.35)',
    fontSize: '0.82rem',
    whiteSpace: 'nowrap',
  },
  companiesWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  companyTag: {
    padding: '5px 8px',
    borderRadius: '8px',
    fontSize: '0.78rem',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.9)',
  },
  pagination: {
    marginTop: '14px',
    padding: '14px 4px 2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  pageButtons: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  pageButton: {
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    borderRadius: '10px',
    minWidth: '38px',
    height: '38px',
    cursor: 'pointer',
    fontWeight: 700,
  },
  noData: {
    padding: '26px 12px',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.72)',
  },
};

function makeSlug(title = '') {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeProblem(problem, index) {
  const difficulty = `${problem.difficulty || 'Easy'}`;
  const diffLower = difficulty.toLowerCase();

  return {
    id: problem.id || `${index + 1}`,
    title: problem.title || `Problem ${index + 1}`,
    topic: problem.topic || 'General',
    difficulty,
    difficultyColor: difficultyColor[diffLower] || '#FFB347',
    companies: Array.isArray(problem.companies) ? problem.companies : [],
    solved: Boolean(problem.solved),
    slug: problem.slug || makeSlug(problem.title || `problem-${index + 1}`),
  };
}

function Problems({ problems = sampleProblems, onProblemClick }) {
  const [search, setSearch] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [topicFilter, setTopicFilter] = useState('All Topics');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);

  const normalized = useMemo(() => problems.map(normalizeProblem), [problems]);

  const topics = useMemo(() => {
    const unique = new Set(normalized.map((problem) => problem.topic));
    return ['All Topics', ...Array.from(unique)];
  }, [normalized]);

  const filtered = useMemo(() => {
    return normalized.filter((problem) => {
      const titleMatch = problem.title.toLowerCase().includes(search.toLowerCase());
      const difficultyMatch = activeDifficulty === 'All' || problem.difficulty.toLowerCase() === activeDifficulty.toLowerCase();
      const topicMatch = topicFilter === 'All Topics' || problem.topic === topicFilter;

      return titleMatch && difficultyMatch && topicMatch;
    });
  }, [normalized, search, activeDifficulty, topicFilter]);

  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    const start = (current - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, current]);

  const filters = ['All', 'Easy', 'Medium', 'Hard'];

  const handleFilterChange = (value) => {
    setActiveDifficulty(value);
    setCurrentPage(1);
  };

  const handleTopicChange = (value) => {
    setTopicFilter(value);
    setCurrentPage(1);
  };

  return (
    <main style={styles.page} className="problems-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Poppins:wght@400;500;700;800&display=swap');

        @keyframes problemsFadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes rowFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .problem-row:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(108, 99, 255, 0.2);
        }

        .filter-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(108, 99, 255, 0.5);
        }

        .filter-btn.is-active {
          box-shadow: 0 0 0 1px rgba(108, 99, 255, 0.5), 0 0 20px rgba(108, 99, 255, 0.32);
          border-color: rgba(108, 99, 255, 0.6);
          background: rgba(108, 99, 255, 0.25);
        }

        .problem-link:hover {
          color: #00F5A0;
        }

        .page-btn.is-active {
          background: rgba(108, 99, 255, 0.3);
          border-color: rgba(108, 99, 255, 0.72);
          box-shadow: 0 0 14px rgba(108, 99, 255, 0.25);
        }

        @media (max-width: 860px) {
          .topic-select {
            margin-left: 0 !important;
            width: 100%;
          }
        }
      `}</style>

      <div style={styles.shell}>
        <section style={{ ...styles.card, ...styles.header }}>
          <h1 style={styles.heading}>Problems 📋</h1>
          <p style={styles.subtitle}>Pick your poison 💀</p>
        </section>

        <section style={{ ...styles.card, ...styles.controlsCard }}>
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              ...styles.search,
              borderColor: searchFocused ? 'rgba(0, 245, 160, 0.65)' : styles.search.border,
              boxShadow: searchFocused ? '0 0 0 1px rgba(0,245,160,0.4), 0 0 20px rgba(0,245,160,0.24)' : 'none',
            }}
          />

          <div style={styles.filtersRow}>
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter-btn ${activeDifficulty === filter ? 'is-active' : ''}`}
                style={styles.filterButton}
                onClick={() => handleFilterChange(filter)}
              >
                {filter}
              </button>
            ))}

            <select
              className="topic-select"
              value={topicFilter}
              onChange={(event) => handleTopicChange(event.target.value)}
              style={styles.topicSelect}
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section style={{ ...styles.card, ...styles.tableCard }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Topic</th>
                <th style={styles.th}>Difficulty</th>
                <th style={styles.th}>Companies</th>
                <th style={styles.th}>Solved</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length ? (
                paginated.map((problem, index) => {
                  const serial = (current - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={problem.id}
                      className="problem-row"
                      style={{
                        ...styles.tr,
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <td style={styles.td}>{serial}</td>
                      <td style={styles.td}>
                        <a
                          href={`/problems/${problem.slug}`}
                          className="problem-link"
                          style={styles.titleLink}
                          onClick={(event) => {
                            if (onProblemClick) {
                              onProblemClick(problem, event);
                            }
                          }}
                        >
                          {problem.title}
                        </a>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.topicPill}>{problem.topic}</span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.topicPill,
                            background: `${problem.difficultyColor}24`,
                            borderColor: `${problem.difficultyColor}66`,
                            color: problem.difficultyColor,
                          }}
                        >
                          {problem.difficulty}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.companiesWrap}>
                          {problem.companies.length
                            ? problem.companies.map((company) => (
                                <span key={company} style={styles.companyTag}>
                                  {company}
                                </span>
                              ))
                            : <span style={styles.companyTag}>N/A</span>}
                        </div>
                      </td>
                      <td style={styles.td}>{problem.solved ? '✅' : '○'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td style={styles.noData} colSpan={6}>
                    No problems found for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={styles.pagination}>
            <span style={{ color: 'rgba(255,255,255,0.68)' }}>
              Showing {paginated.length} of {filtered.length} problems
            </span>

            <div style={styles.pageButtons}>
              <button
                type="button"
                style={styles.pageButton}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={current === 1}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }).map((_, pageIndex) => {
                const page = pageIndex + 1;
                return (
                  <button
                    key={page}
                    type="button"
                    className={`page-btn ${page === current ? 'is-active' : ''}`}
                    style={styles.pageButton}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                type="button"
                style={styles.pageButton}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={current === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Problems;
