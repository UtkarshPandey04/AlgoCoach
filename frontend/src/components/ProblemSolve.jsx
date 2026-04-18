import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';

const languageOptions = [
  { label: 'C++', value: 'cpp' },
  { label: 'Java', value: 'java' },
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
];

const defaultProblem = {
  title: 'Two Sum',
  difficulty: 'Easy',
  description:
    'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'nums[0] + nums[1] == 9',
    },
  ],
  constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9'],
  companies: ['Amazon', 'Google', 'Meta'],
  starterCode: {
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  // write code\n  return 0;\n}\n',
    java: 'class Solution {\n  public static void main(String[] args) {\n    // write code\n  }\n}\n',
    python: 'def solve(nums, target):\n    # write code\n    pass\n',
    javascript: 'function solve(nums, target) {\n  // write code\n}\n',
  },
};

const difficultyStyles = {
  easy: { color: '#00F5A0', background: 'rgba(0, 245, 160, 0.12)', border: '1px solid rgba(0, 245, 160, 0.4)' },
  medium: { color: '#FFB347', background: 'rgba(255, 179, 71, 0.14)', border: '1px solid rgba(255, 179, 71, 0.44)' },
  hard: { color: '#FF6B6B', background: 'rgba(255, 107, 107, 0.14)', border: '1px solid rgba(255, 107, 107, 0.44)' },
};

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  padding: { top: 16, bottom: 16 },
  wordWrap: 'on',
};

const styles = {
  page: {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at 10% 12%, rgba(108, 99, 255, 0.2), transparent 22%), radial-gradient(circle at 90% 8%, rgba(0, 245, 160, 0.08), transparent 18%), #0D0D0D',
    color: '#F8F8FF',
    fontFamily: 'Inter, Poppins, sans-serif',
    padding: '14px',
    display: 'grid',
  },
  splitLayout: {
    width: '100%',
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '40% 60%',
    gap: '14px',
    minHeight: 'calc(100vh - 28px)',
  },
  panel: {
    background: 'rgba(18, 18, 30, 0.78)',
    border: '1px solid #6C63FF',
    boxShadow: '0 0 22px rgba(108, 99, 255, 0.22)',
    borderRadius: '18px',
    backdropFilter: 'blur(16px)',
    overflow: 'hidden',
    display: 'grid',
  },
  leftPanel: {
    animation: 'slideFromLeft 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
    gridTemplateRows: '1fr',
  },
  rightPanel: {
    animation: 'slideFromRight 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
    gridTemplateRows: '1fr auto',
  },
  scrollArea: {
    overflowY: 'auto',
    padding: '20px',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(1.4rem, 2.6vw, 2rem)',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: '0 0 14px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.6,
  },
  difficulty: {
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '999px',
    padding: '7px 12px',
    fontWeight: 700,
    fontSize: '0.84rem',
    marginTop: '10px',
  },
  section: {
    marginTop: '18px',
    display: 'grid',
    gap: '10px',
  },
  sectionHeading: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#C2BCFF',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  codeBlock: {
    margin: 0,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '12px',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontSize: '0.9rem',
    lineHeight: 1.55,
    fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace',
  },
  companyRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  companyTag: {
    borderRadius: '999px',
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)',
    fontSize: '0.8rem',
  },
  hintButton: {
    border: '1px solid rgba(0, 245, 160, 0.52)',
    background: 'rgba(0, 245, 160, 0.1)',
    color: '#00F5A0',
    fontWeight: 700,
    padding: '11px 14px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 180ms ease, box-shadow 180ms ease',
    animation: 'hintPulse 1.8s ease-in-out infinite',
  },
  hintArea: {
    minHeight: '62px',
    borderRadius: '12px',
    border: '1px dashed rgba(0, 245, 160, 0.32)',
    background: 'rgba(0, 245, 160, 0.06)',
    padding: '10px 12px',
    color: '#D8FFF1',
    lineHeight: 1.6,
  },
  rightHeader: {
    padding: '14px 16px 10px',
    borderBottom: '1px solid rgba(108, 99, 255, 0.35)',
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  select: {
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    padding: '9px 10px',
    minWidth: '170px',
    outline: 'none',
  },
  editorWrap: {
    padding: '10px 12px 12px',
    display: 'grid',
    gridTemplateRows: 'minmax(380px, 1fr) auto',
    gap: '12px',
  },
  editorShell: {
    overflow: 'hidden',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  actions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  runButton: {
    position: 'relative',
    overflow: 'hidden',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6C63FF, #5147ff)',
    color: '#fff',
    fontWeight: 700,
    padding: '11px 16px',
    cursor: 'pointer',
  },
  submitButton: {
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    fontWeight: 700,
    padding: '11px 16px',
    cursor: 'pointer',
  },
  ripple: {
    position: 'absolute',
    borderRadius: '50%',
    transform: 'scale(0)',
    background: 'rgba(255,255,255,0.45)',
    animation: 'rippleEffect 650ms linear',
    pointerEvents: 'none',
  },
  spinner: {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.5)',
    borderTopColor: '#fff',
    animation: 'spin 700ms linear infinite',
    display: 'inline-block',
    marginRight: '8px',
    verticalAlign: 'middle',
  },
  outputWrap: {
    borderTop: '1px solid rgba(108, 99, 255, 0.35)',
    padding: '12px 14px 14px',
    background: 'rgba(11, 11, 20, 0.7)',
  },
  outputCard: {
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    padding: '12px',
    animation: 'slideUpResult 420ms ease both',
  },
  outputMeta: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '8px',
  },
  statusPill: {
    borderRadius: '999px',
    padding: '6px 10px',
    fontWeight: 700,
    fontSize: '0.82rem',
  },
  testList: {
    margin: '8px 0 0',
    paddingLeft: '18px',
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.85)',
  },
};

function getStarterCode(problemData, language) {
  const starter = problemData?.starterCode;

  if (starter && typeof starter === 'object') {
    return starter[language] || starter.python || '';
  }

  return (
    starter ||
    {
      cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}\n',
      java: 'class Solution {\n  public static void main(String[] args) {\n  }\n}\n',
      python: 'def solve():\n    pass\n',
      javascript: 'function solve() {\n}\n',
    }[language]
  );
}

async function requestHint(problemData, code, language) {
  const response = await fetch('/api/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem: problemData, code, language }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch hint');
  }

  const data = await response.json();
  return data?.hint || 'Think about reducing time complexity using a map/dictionary.';
}

function normalizeResult(raw) {
  if (!raw) {
    return {
      status: 'Accepted',
      runtime: '31 ms',
      testCases: ['Case 1: Passed', 'Case 2: Passed', 'Case 3: Passed'],
    };
  }

  return {
    status: raw.status || 'Accepted',
    runtime: raw.runtime || 'N/A',
    testCases: raw.testCases || raw.tests || [],
  };
}

function ProblemSolve({ problem = defaultProblem, onRunCode, onGetHint }) {
  const problemData = problem || defaultProblem;
  const [language, setLanguage] = useState('python');
  const [codeByLanguage, setCodeByLanguage] = useState(() => ({
    cpp: getStarterCode(problemData, 'cpp'),
    java: getStarterCode(problemData, 'java'),
    python: getStarterCode(problemData, 'python'),
    javascript: getStarterCode(problemData, 'javascript'),
  }));
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [hint, setHint] = useState('');
  const [typedHint, setTypedHint] = useState('');
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    setCodeByLanguage({
      cpp: getStarterCode(problemData, 'cpp'),
      java: getStarterCode(problemData, 'java'),
      python: getStarterCode(problemData, 'python'),
      javascript: getStarterCode(problemData, 'javascript'),
    });
    setOutput(null);
    setHint('');
    setTypedHint('');
  }, [problemData]);

  useEffect(() => {
    if (!hint) {
      setTypedHint('');
      return undefined;
    }

    let index = 0;
    setTypedHint('');
    const timer = window.setInterval(() => {
      index += 1;
      setTypedHint(hint.slice(0, index));
      if (index >= hint.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [hint]);

  const difficultyStyle = useMemo(() => {
    const key = `${problemData?.difficulty || 'easy'}`.toLowerCase();
    return difficultyStyles[key] || difficultyStyles.medium;
  }, [problemData]);

  const currentCode = codeByLanguage[language] || '';

  const createRipple = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setRipples((prev) => [...prev, { id, x, y, size }]);

    window.setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 700);
  };

  const handleRunCode = async (event) => {
    createRipple(event);
    setIsRunning(true);

    try {
      const result = onRunCode
        ? await onRunCode({
            problem: problemData,
            language,
            code: currentCode,
          })
        : null;

      setOutput(normalizeResult(result));
    } catch (error) {
      setOutput(
        normalizeResult({
          status: 'Wrong Answer',
          runtime: 'N/A',
          testCases: [error?.message || 'Execution failed. Please try again.'],
        }),
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!onRunCode) {
      setOutput(
        normalizeResult({
          status: 'Accepted',
          runtime: '24 ms',
          testCases: ['Submitted in mock mode', 'All visible tests passed'],
        }),
      );
      return;
    }

    setIsRunning(true);
    try {
      const result = await onRunCode({
        problem: problemData,
        language,
        code: currentCode,
        submit: true,
      });
      setOutput(normalizeResult(result));
    } catch (error) {
      setOutput(
        normalizeResult({
          status: 'TLE',
          runtime: 'N/A',
          testCases: [error?.message || 'Submission timed out.'],
        }),
      );
    } finally {
      setIsRunning(false);
    }
  };

  const handleGetHint = async () => {
    setIsHintLoading(true);

    try {
      const result = onGetHint
        ? await onGetHint({ problem: problemData, language, code: currentCode })
        : await requestHint(problemData, currentCode, language);

      if (typeof result === 'string') {
        setHint(result);
      } else {
        setHint(result?.hint || 'Try using a hash map to track values in one pass.');
      }
    } catch {
      setHint('Hint unavailable right now. Try simplifying your approach and checking edge cases.');
    } finally {
      setIsHintLoading(false);
    }
  };

  const statusText = output?.status || '';
  const statusLower = statusText.toLowerCase();
  const isAccepted = statusLower.includes('accepted');
  const isErrorState = statusLower.includes('wrong') || statusLower.includes('tle') || statusLower.includes('error');

  return (
    <main style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=Poppins:wght@400;500;700;800&display=swap');

        @keyframes slideFromLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes hintPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(0, 245, 160, 0); }
          50% { box-shadow: 0 0 24px rgba(0, 245, 160, 0.25); }
        }

        @keyframes rippleEffect {
          to { transform: scale(4.3); opacity: 0; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideUpResult {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes successFlash {
          0%, 100% { box-shadow: 0 0 0 rgba(0, 245, 160, 0); }
          50% { box-shadow: 0 0 22px rgba(0, 245, 160, 0.4); }
        }

        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
          75% { transform: translateX(-4px); }
        }

        .run-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 24px rgba(108, 99, 255, 0.35);
        }

        .submit-btn:hover,
        .hint-btn:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 1080px) {
          .problem-solve-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <section style={styles.splitLayout} className="problem-solve-grid">
        <aside style={{ ...styles.panel, ...styles.leftPanel }}>
          <div style={styles.scrollArea}>
            <h1 style={styles.title}>{problemData.title}</h1>
            <div style={{ ...styles.difficulty, ...difficultyStyle }}>{problemData.difficulty}</div>

            <section style={styles.section}>
              <h2 style={styles.sectionHeading}>Description</h2>
              <p style={styles.subtitle}>{problemData.description}</p>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionHeading}>Examples</h2>
              {(problemData.examples || []).map((example, index) => (
                <article key={`example-${index}`}>
                  <pre style={styles.codeBlock}>{`Input: ${example.input}\nOutput: ${example.output}${example.explanation ? `\nExplanation: ${example.explanation}` : ''}`}</pre>
                </article>
              ))}
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionHeading}>Constraints</h2>
              <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.7 }}>
                {(problemData.constraints || []).map((constraint, index) => (
                  <li key={`constraint-${index}`}>{constraint}</li>
                ))}
              </ul>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionHeading}>Companies</h2>
              <div style={styles.companyRow}>
                {(problemData.companies || []).map((company) => (
                  <span key={company} style={styles.companyTag}>
                    {company}
                  </span>
                ))}
              </div>
            </section>

            <section style={styles.section}>
              <button className="hint-btn" type="button" onClick={handleGetHint} style={styles.hintButton} disabled={isHintLoading}>
                {isHintLoading ? 'Getting hint...' : '💡 Get AI Hint'}
              </button>
              <div style={styles.hintArea}>{typedHint || 'Hint will appear here...'}</div>
            </section>
          </div>
        </aside>

        <section style={{ ...styles.panel, ...styles.rightPanel }}>
          <header style={styles.rightHeader}>
            <strong>Code Workspace</strong>
            <select value={language} onChange={(event) => setLanguage(event.target.value)} style={styles.select}>
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </header>

          <div style={styles.editorWrap}>
            <div style={styles.editorShell}>
              <Editor
                theme="vs-dark"
                language={language}
                value={currentCode}
                options={editorOptions}
                onChange={(value) => {
                  setCodeByLanguage((prev) => ({
                    ...prev,
                    [language]: value ?? '',
                  }));
                }}
              />
            </div>

            <div style={styles.actions}>
              <button className="run-btn" type="button" onClick={handleRunCode} style={styles.runButton} disabled={isRunning}>
                {ripples.map((ripple) => (
                  <span
                    key={ripple.id}
                    style={{
                      ...styles.ripple,
                      left: ripple.x,
                      top: ripple.y,
                      width: ripple.size,
                      height: ripple.size,
                    }}
                  />
                ))}
                {isRunning ? (
                  <>
                    <span style={styles.spinner} /> Running...
                  </>
                ) : (
                  '▶ Run Code'
                )}
              </button>
              <button className="submit-btn" type="button" onClick={handleSubmit} style={styles.submitButton} disabled={isRunning}>
                Submit
              </button>
            </div>
          </div>

          <footer style={styles.outputWrap}>
            {output ? (
              <div
                style={{
                  ...styles.outputCard,
                  animation: `${isAccepted ? 'successFlash 700ms ease' : isErrorState ? 'errorShake 400ms ease' : 'slideUpResult 420ms ease'} both`,
                  borderColor: isAccepted
                    ? 'rgba(0, 245, 160, 0.45)'
                    : isErrorState
                    ? 'rgba(255, 107, 107, 0.55)'
                    : 'rgba(255,255,255,0.15)',
                }}
              >
                <div style={styles.outputMeta}>
                  <span
                    style={{
                      ...styles.statusPill,
                      color: isAccepted ? '#00F5A0' : isErrorState ? '#FF6B6B' : '#FFB347',
                      background: isAccepted
                        ? 'rgba(0, 245, 160, 0.1)'
                        : isErrorState
                        ? 'rgba(255, 107, 107, 0.12)'
                        : 'rgba(255, 179, 71, 0.12)',
                      border: `1px solid ${isAccepted ? 'rgba(0,245,160,0.45)' : isErrorState ? 'rgba(255,107,107,0.45)' : 'rgba(255,179,71,0.45)'}`,
                    }}
                  >
                    {output.status}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.78)' }}>Runtime: {output.runtime}</span>
                </div>

                <strong>Test Cases</strong>
                <ul style={styles.testList}>
                  {(output.testCases || []).map((testCase, index) => (
                    <li key={`test-${index}`}>{testCase}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.62)' }}>Output will appear after running your code.</div>
            )}
          </footer>
        </section>
      </section>
    </main>
  );
}

export default ProblemSolve;
