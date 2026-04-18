import { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardOverview } from '../services/dashboardService';
import { fetchCurrentUser, getCurrentUser, logoutUser } from '../services/authService';
import {
  fetchAdminDashboard,
  fetchHint,
  fetchLeaderboard,
  fetchMockSession,
  fetchProblemCatalog,
  fetchProblemDetail,
  fetchProfileOverview,
  runCode,
} from '../services/platformService';

const pageTitles = {
  dashboard: 'Dashboard',
  problems: 'Problems',
  solve: 'Code Editor',
  mock: 'Mock Interview',
  leaderboard: 'Leaderboard',
  profile: 'Profile',
  admin: 'Admin Panel',
};

const navSections = [
  {
    label: 'Main',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
      { key: 'problems', label: 'Problems', icon: '📋' },
      { key: 'solve', label: 'Code Editor', icon: '💻' },
    ],
  },
  {
    label: 'Compete',
    items: [
      { key: 'mock', label: 'Mock Interview', icon: '🎯' },
      { key: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    ],
  },
  {
    label: 'You',
    items: [
      { key: 'profile', label: 'Profile', icon: '👤' },
      { key: 'admin', label: 'Admin Panel', icon: '⚙️' },
    ],
  },
];

const fallbackProblems = [
  {
    id: 'array-01',
    title: 'Two Sum',
    topic: 'Arrays',
    difficulty: 'Easy',
    companies: ['Amazon', 'Google'],
    solved: true,
    slug: 'two-sum-reflection',
  },
  {
    id: 'graph-02',
    title: 'Number of Islands',
    topic: 'Graphs',
    difficulty: 'Medium',
    companies: ['Meta', 'Microsoft'],
    solved: false,
    slug: 'number-of-islands',
  },
  {
    id: 'tree-03',
    title: 'Binary Tree Level Order',
    topic: 'Trees',
    difficulty: 'Medium',
    companies: ['Facebook'],
    solved: true,
    slug: 'binary-tree-level-order',
  },
  {
    id: 'dp-04',
    title: 'Coin Change',
    topic: 'DP',
    difficulty: 'Medium',
    companies: ['Amazon'],
    solved: false,
    slug: 'coin-change',
  },
  {
    id: 'hard-05',
    title: 'LRU Cache',
    topic: 'Design',
    difficulty: 'Hard',
    companies: ['Google', 'Meta'],
    solved: false,
    slug: 'lru-cache',
  },
];

const fallbackLeaderboard = [
  { id: 'u1', name: 'Aarav Mehta', college: 'IIT Bombay', problemsSolved: 89, streak: 21, score: 456 },
  { id: 'u2', name: 'Priya Shah', college: 'IIT Delhi', problemsSolved: 72, streak: 14, score: 312 },
  { id: 'u3', name: 'Meera Gupta', college: 'NIT Trichy', problemsSolved: 68, streak: 9, score: 287 },
  { id: 'u4', name: 'Rohit Malhotra', college: 'BITS Pilani', problemsSolved: 61, streak: 7, score: 241 },
];

const fallbackProfile = {
  user: {
    id: 'u-you',
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    role: 'student',
    college: 'IIT Kanpur',
    batch: '2025',
  },
  stats: {
    solved: 142,
    streak: 7,
    rank: 12,
    accuracy: 78,
    topicProgress: {
      Arrays: 82,
      Trees: 65,
      DP: 41,
      Graphs: 28,
      Strings: 70,
    },
    difficultyBreakdown: { easy: 64, medium: 51, hard: 27 },
  },
  badges: ['First Solve 🎯', '7 Day Streak 🔥', 'AI Free Solve 💪'],
  submissions: [
    { id: 's1', problem: 'Two Sum', topic: 'Arrays', status: 'Accepted', runtime: '18 ms', submittedAt: '2h ago' },
    { id: 's2', problem: 'Coin Change', topic: 'DP', status: 'Wrong Answer', runtime: 'N/A', submittedAt: '1d ago' },
  ],
};

const fallbackOverview = {
  headline: 'Welcome back, Rahul',
  subheadline: 'Your AlgoCoach workspace is tuned for interview prep, revision, and live coding reps.',
  stats: [
    { label: 'Practice streak', value: '12 days', change: '+3 this week' },
    { label: 'Problems solved', value: '48', change: '+8 since last review' },
    { label: 'Mock score', value: '78%', change: '+11% improvement' },
    { label: 'Readiness', value: 'Strong', change: 'Arrays and graphs trending up' },
  ],
  focus_areas: [
    {
      title: 'Graph traversal',
      detail: 'Review BFS vs DFS decision patterns and shortest path templates.',
      level: 'High impact',
    },
    {
      title: 'Dynamic programming',
      detail: 'Spend one focused block on state transitions and memoization shortcuts.',
      level: 'Warm-up',
    },
    {
      title: 'Behavioral storytelling',
      detail: 'Refine two STAR stories tied to ownership and debugging under pressure.',
      level: 'Interview ready',
    },
  ],
  daily_plan: [
    {
      time: '09:00',
      title: 'Warm-up set',
      description: 'Solve one easy array problem and narrate the brute-force approach first.',
    },
    {
      time: '13:30',
      title: 'Focused coding round',
      description: 'Use the code editor to implement one medium graph problem in 35 minutes.',
    },
    {
      time: '19:00',
      title: 'Reflection pass',
      description: 'Capture mistakes, edge cases, and one reusable interview insight.',
    },
  ],
  recent_activity: [
    {
      title: 'Binary Search revision',
      description: 'Completed pattern recap with clean boundary handling notes.',
      status: 'Complete',
    },
    {
      title: 'Two-pointer mock',
      description: 'Strong runtime explanation, but missed one duplicate edge case.',
      status: 'Needs follow-up',
    },
    {
      title: 'Resume bullet cleanup',
      description: 'Converted project work into impact-oriented achievement statements.',
      status: 'Ready',
    },
  ],
  roadmap: [
    {
      phase: 'Phase 01',
      title: 'Sharpen core patterns',
      description: 'Build confidence with arrays, strings, hashing, and binary search.',
    },
    {
      phase: 'Phase 02',
      title: 'Simulate interview pressure',
      description: 'Practice timed mediums with explanation-first thinking and cleaner tradeoffs.',
    },
    {
      phase: 'Phase 03',
      title: 'Polish placement readiness',
      description: 'Blend coding, resume stories, and company-specific revision into one routine.',
    },
  ],
};

const fallbackAdmin = {
  user: { role: 'admin', name: 'Admin User' },
  kpis: { totalStudents: 1280, activeToday: 346, avgScore: 78, totalSubmissions: 19840 },
  submissionsPerDay: [120, 145, 132, 190, 214, 240, 206],
  difficultyDistribution: { easy: 45, medium: 38, hard: 17 },
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
  ],
  students: [
    { id: 's1', name: 'Aarav Mehta', email: 'aarav@example.com', batch: '2026', college: 'IIT Delhi', problemsSolved: 340, lastActive: '5m ago' },
    { id: 's2', name: 'Riya Shah', email: 'riya@example.com', batch: '2025', college: 'NIT Trichy', problemsSolved: 322, lastActive: '9m ago' },
  ],
};

const defaultProblemDetail = {
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
    javascript: 'function solve(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i += 1) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n}\n',
    python: 'def solve(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        need = target - num\n        if need in seen:\n            return [seen[need], i]\n        seen[num] = i\n',
    java: 'class Solution {\n  public int[] solve(int[] nums, int target) {\n    java.util.Map<Integer, Integer> seen = new java.util.HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n      int need = target - nums[i];\n      if (seen.containsKey(need)) return new int[]{seen.get(need), i};\n      seen.put(nums[i], i);\n    }\n    return new int[]{};\n  }\n}\n',
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> solve(vector<int>& nums, int target) {\n  unordered_map<int,int> seen;\n  for (int i = 0; i < (int)nums.size(); i++) {\n    int need = target - nums[i];\n    if (seen.count(need)) return {seen[need], i};\n    seen[nums[i]] = i;\n  }\n  return {};\n}\n',
  },
};

const languageOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
];

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  padding: { top: 16, bottom: 16 },
  wordWrap: 'on',
  automaticLayout: true,
};

const fallbackMockSession = {
  durationSeconds: 45 * 60,
  questionCount: 5,
  currentQuestion: {
    id: 'mock-01',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    prompt:
      "Given a string containing only the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    exampleInput: 's = "()[]{}"',
    exampleOutput: 'true',
    starterCode: {
      python:
        'def is_valid(s: str) -> bool:\n    stack = []\n    pairs = {\')\': \'(\', \'}\': \'{\', \']\': \'[\'}\n    for ch in s:\n        if ch in pairs:\n            if not stack or stack[-1] != pairs[ch]:\n                return False\n            stack.pop()\n        else:\n            stack.append(ch)\n    return not stack\n',
      javascript:
        'function isValid(s) {\n  const stack = [];\n  const pairs = { \")\": "(", "}": "{", "]": "[" };\n  for (const ch of s) {\n    if (pairs[ch]) {\n      if (!stack.length || stack[stack.length - 1] !== pairs[ch]) return false;\n      stack.pop();\n    } else {\n      stack.push(ch);\n    }\n  }\n  return stack.length === 0;\n}\n',
    },
  },
};

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'G';
}

function difficultyClass(difficulty = '') {
  const normalized = difficulty.toLowerCase();
  if (normalized.includes('hard')) return 'badge-hard';
  if (normalized.includes('medium')) return 'badge-medium';
  return 'badge-easy';
}

function createProblemDetail(problem) {
  if (!problem) {
    return defaultProblemDetail;
  }

  return {
    title: problem.title || defaultProblemDetail.title,
    difficulty: problem.difficulty || defaultProblemDetail.difficulty,
    description: problem.description || defaultProblemDetail.description,
    examples: problem.examples || defaultProblemDetail.examples,
    constraints: problem.constraints || defaultProblemDetail.constraints,
    companies: problem.companies || defaultProblemDetail.companies,
    starterCode: problem.starterCode || defaultProblemDetail.starterCode,
  };
}

function createStarterMap(detail) {
  const starter = detail?.starterCode || defaultProblemDetail.starterCode;

  return {
    javascript: starter.javascript || defaultProblemDetail.starterCode.javascript,
    python: starter.python || defaultProblemDetail.starterCode.python,
    java: starter.java || defaultProblemDetail.starterCode.java,
    cpp: starter.cpp || defaultProblemDetail.starterCode.cpp,
  };
}

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeItem, setActiveItem] = useState('dashboard');
  const [problemCatalog, setProblemCatalog] = useState(fallbackProblems);
  const [selectedProblem, setSelectedProblem] = useState(fallbackProblems[0]);
  const [selectedProblemDetail, setSelectedProblemDetail] = useState(defaultProblemDetail);
  const [problemSearch, setProblemSearch] = useState('');
  const [problemTopic, setProblemTopic] = useState('All Topics');
  const [problemDifficulty, setProblemDifficulty] = useState('All');
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(fallbackProfile);
  const [leaderboardData, setLeaderboardData] = useState(fallbackLeaderboard);
  const [adminData, setAdminData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [codeByLanguage, setCodeByLanguage] = useState(createStarterMap(defaultProblemDetail));
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [mockSeconds, setMockSeconds] = useState(38 * 60 + 42);
  const [mockRunning, setMockRunning] = useState(true);
  const [mockSession, setMockSession] = useState(fallbackMockSession);

  const displayName = user?.name || 'Guest';
  const isAdmin = (user?.role || '').toLowerCase() === 'admin';
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const visibleNavSections = useMemo(
    () =>
      navSections
        .map((section) => {
          if (section.label !== 'You') {
            return section;
          }

          return {
            ...section,
            items: section.items.filter((item) => item.key !== 'admin' || isAdmin),
          };
        })
        .filter((section) => section.items.length > 0),
    [isAdmin],
  );

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      setLoading(true);
      setError('');

      try {
        const freshUser = await fetchCurrentUser();
        if (!isMounted) {
          return;
        }

        const normalizedUser = {
          ...(user || {}),
          ...freshUser,
          role: freshUser.role || user?.role || 'student',
        };

        setUser((currentUser) => ({
          ...(currentUser || {}),
          ...normalizedUser,
        }));

        const nextIsAdmin = (normalizedUser.role || '').toLowerCase() === 'admin';

        const [overviewResult, catalogResult, profileResult, leaderboardResult, mockResult, adminResult] = await Promise.allSettled([
          fetchDashboardOverview(),
          fetchProblemCatalog(),
          fetchProfileOverview(),
          fetchLeaderboard(),
          fetchMockSession(),
          nextIsAdmin ? fetchAdminDashboard() : Promise.resolve(null),
        ]);

        if (!isMounted) {
          return;
        }

        if (overviewResult.status === 'fulfilled' && overviewResult.value) {
          setDashboardData(overviewResult.value);
        } else {
          setDashboardData(fallbackOverview);
        }

        const catalog = catalogResult.status === 'fulfilled' && catalogResult.value.length ? catalogResult.value : fallbackProblems;
        setProblemCatalog(catalog);

        const firstProblem = catalog[0] || fallbackProblems[0];
        setSelectedProblem(firstProblem);

        try {
          const detail = await fetchProblemDetail(firstProblem.slug);
          if (isMounted) {
            const normalizedDetail = createProblemDetail({ ...firstProblem, ...detail });
            setSelectedProblemDetail(normalizedDetail);
            setCodeByLanguage(createStarterMap(normalizedDetail));
          }
        } catch {
          if (isMounted) {
            const normalizedDetail = createProblemDetail(firstProblem);
            setSelectedProblemDetail(normalizedDetail);
            setCodeByLanguage(createStarterMap(normalizedDetail));
          }
        }

        if (profileResult.status === 'fulfilled' && profileResult.value) {
          setProfileData(profileResult.value);
        } else {
          setProfileData(fallbackProfile);
        }

        if (leaderboardResult.status === 'fulfilled' && leaderboardResult.value.length) {
          setLeaderboardData(leaderboardResult.value);
        } else {
          setLeaderboardData(fallbackLeaderboard);
        }

        if (mockResult.status === 'fulfilled' && mockResult.value) {
          const sessionData = {
            ...fallbackMockSession,
            ...mockResult.value,
            currentQuestion: {
              ...fallbackMockSession.currentQuestion,
              ...(mockResult.value.currentQuestion || {}),
            },
          };

          setMockSession(sessionData);
          setMockSeconds(sessionData.durationSeconds || fallbackMockSession.durationSeconds);
        } else {
          setMockSession(fallbackMockSession);
          setMockSeconds(fallbackMockSession.durationSeconds);
        }

        if (nextIsAdmin && adminResult.status === 'fulfilled' && adminResult.value) {
          setAdminData(adminResult.value);
        } else if (nextIsAdmin) {
          setAdminData(fallbackAdmin);
        } else {
          setAdminData(null);
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'We could not load your workspace right now.';

        if (err.response?.status === 401) {
          logoutUser();
          navigate('/login', { replace: true });
          return;
        }

        setError(message);
        setProblemCatalog(fallbackProblems);
        setSelectedProblem(fallbackProblems[0]);
        setSelectedProblemDetail(defaultProblemDetail);
        setCodeByLanguage(createStarterMap(defaultProblemDetail));
        setDashboardData(fallbackOverview);
        setProfileData(fallbackProfile);
        setLeaderboardData(fallbackLeaderboard);
        setMockSession(fallbackMockSession);
        setMockSeconds(fallbackMockSession.durationSeconds);
        setAdminData((user?.role || '').toLowerCase() === 'admin' ? fallbackAdmin : null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (activeItem !== 'mock' || !mockRunning) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setMockSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [activeItem, mockRunning]);

  const activeProblemDetail = selectedProblemDetail || createProblemDetail(selectedProblem);
  const currentCode = codeByLanguage[selectedLanguage] || '';

  const filteredProblems = useMemo(() => {
    return problemCatalog.filter((problem) => {
      const matchesQuery = problem.title.toLowerCase().includes(problemSearch.toLowerCase());
      const matchesTopic = problemTopic === 'All Topics' || problem.topic === problemTopic;
      const matchesDifficulty = problemDifficulty === 'All' || problem.difficulty.toLowerCase() === problemDifficulty.toLowerCase();

      return matchesQuery && matchesTopic && matchesDifficulty;
    });
  }, [problemCatalog, problemDifficulty, problemSearch, problemTopic]);

  const topics = useMemo(() => ['All Topics', ...new Set(problemCatalog.map((problem) => problem.topic))], [problemCatalog]);

  const openProblem = async (problem) => {
    setSelectedProblem(problem);
    setActiveItem('solve');
    setHint('');
    setRunResult(null);
    setSelectedLanguage('javascript');

    try {
      const detail = await fetchProblemDetail(problem.slug);
      const normalizedDetail = createProblemDetail({ ...problem, ...detail });
      setSelectedProblemDetail(normalizedDetail);
      setCodeByLanguage(createStarterMap(normalizedDetail));
    } catch {
      const normalizedDetail = createProblemDetail(problem);
      setSelectedProblemDetail(normalizedDetail);
      setCodeByLanguage(createStarterMap(normalizedDetail));
    }
  };

  const updateCode = (value) => {
    setCodeByLanguage((current) => ({
      ...current,
      [selectedLanguage]: value || '',
    }));
  };

  const handleGetHint = async () => {
    setHintLoading(true);

    try {
      const response = await fetchHint({
        problem: activeProblemDetail,
        code: currentCode,
        language: selectedLanguage,
      });

      setHint(response?.hint || 'Think about using a hash map to avoid nested loops.');
    } catch {
      setHint('Try reducing the problem into a single pass and keep edge cases first.');
    } finally {
      setHintLoading(false);
    }
  };

  const handleRunCode = async (submit = false) => {
    setIsRunning(true);

    try {
      const response = await runCode({
        problem: activeProblemDetail,
        code: currentCode,
        language: selectedLanguage,
        submit,
      });

      setRunResult(response);
    } catch {
      setRunResult({
        status: 'Wrong Answer',
        runtime: 'N/A',
        testCases: ['Execution failed', 'Please try again'],
      });
    } finally {
      setIsRunning(false);
    }
  };

  const formatSeconds = (seconds) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainder = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainder}`;
  };

  const selectedTopicCount = profileData?.stats?.topicProgress || fallbackProfile.stats.topicProgress;
  const difficultyBreakdown = profileData?.stats?.difficultyBreakdown || fallbackProfile.stats.difficultyBreakdown;
  const leaderboardSlice = leaderboardData.slice(0, 3);
  const dashboardOverview = dashboardData || fallbackOverview;
  const overviewStats = dashboardOverview.stats || fallbackOverview.stats;
  const overviewRecentActivity = dashboardOverview.recent_activity || fallbackOverview.recent_activity;
  const profileUser = profileData?.user || fallbackProfile.user;
  const mockQuestion = mockSession?.currentQuestion || fallbackMockSession.currentQuestion;
  const mockEditorCode = mockQuestion.starterCode?.python || fallbackMockSession.currentQuestion.starterCode.python;
  const dashboardStats = useMemo(() => {
    const colors = ['var(--purple2)', 'var(--orange)', 'var(--pink)', 'var(--green)'];

    return overviewStats.map((stat, index) => ({
      label: stat.label,
      value: stat.value,
      sub: stat.change,
      color: colors[index % colors.length],
    }));
  }, [overviewStats]);

  const adminKpis = adminData?.kpis || fallbackAdmin.kpis;
  const adminStudents = adminData?.students || fallbackAdmin.students;
  const adminRecentActivity = adminData?.recentActivity || fallbackAdmin.recentActivity;
  const adminSubmissionSeries = adminData?.submissionsPerDay || fallbackAdmin.submissionsPerDay;

  return (
    <main className="algo-shell">
      <style>{`
        :root{
          --bg:#080810;--bg2:#0f0f1a;--bg3:#161625;--bg4:#1e1e30;
          --purple:#7c6dfa;--purple2:#a78bfa;--green:#00e5a0;--pink:#f472b6;
          --orange:#fb923c;--red:#f87171;
          --text:#e2e0ff;--text2:#9490b5;--text3:#5a5680;
          --border:#2a2845;--border2:#3d3a60;
          --card-glow:0 0 0 1px #2a2845,0 4px 24px rgba(124,109,250,0.08);
        }

        .algo-shell,
        .algo-shell * { box-sizing: border-box; }

        .algo-shell {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          font-family: 'Space Grotesk', sans-serif;
        }

        .algo-shell a { color: inherit; text-decoration: none; }

        .app { display: flex; min-height: 100vh; }
        .sidebar { width: 220px; min-height: 100vh; background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; z-index: 100; }
        .logo { padding: 24px 20px 20px; border-bottom: 1px solid var(--border); }
        .logo-text { font-size: 20px; font-weight: 700; background: linear-gradient(135deg,var(--purple),var(--green)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .logo-sub { font-size: 11px; color: var(--text3); letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }
        .nav { padding: 16px 12px; flex: 1; }
        .nav-section { font-size: 10px; color: var(--text3); letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 8px 6px; margin-top: 8px; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 500; color: var(--text2); transition: all 0.2s; margin-bottom: 2px; border: 1px solid transparent; background: transparent; width: 100%; text-align: left; }
        .nav-item:hover { background: var(--bg3); color: var(--text); border-color: var(--border); }
        .nav-item.active { background: linear-gradient(135deg,rgba(124,109,250,0.15),rgba(0,229,160,0.08)); color: var(--purple2); border-color: rgba(124,109,250,0.3); }
        .nav-icon { font-size: 16px; width: 20px; text-align: center; }
        .sidebar-bottom { padding: 16px 12px; border-top: 1px solid var(--border); }
        .user-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: var(--bg3); border: 1px solid var(--border); }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,var(--purple),var(--green)); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .user-name { font-size: 13px; font-weight: 600; color: var(--text); }
        .user-role { font-size: 11px; color: var(--text3); }
        .main { margin-left: 220px; flex: 1; min-height: 100vh; }
        .topbar { height: 60px; background: rgba(8,8,16,0.8); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 50; }
        .page-title { font-size: 16px; font-weight: 600; color: var(--text); }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .streak-badge { display: flex; align-items: center; gap: 6px; background: rgba(251,146,60,0.12); border: 1px solid rgba(251,146,60,0.25); border-radius: 20px; padding: 6px 12px; font-size: 13px; font-weight: 600; color: var(--orange); }
        .content { padding: 28px; }
        .page { display: none; animation: fadeIn 0.3s ease; }
        .page.active { display: block; }
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .card { background: var(--bg3); border: 1px solid var(--border); border-radius: 14px; padding: 20px; box-shadow: var(--card-glow); }
        .card-hover { transition: all 0.2s; cursor: pointer; }
        .card-hover:hover { border-color: var(--border2); transform: translateY(-2px); }
        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
        .stat-label { font-size: 12px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .stat-value { font-size: 28px; font-weight: 700; line-height: 1; }
        .stat-sub { font-size: 12px; color: var(--text3); margin-top: 6px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; }
        .badge-easy { background: rgba(0,229,160,0.12); color: var(--green); border: 1px solid rgba(0,229,160,0.2); }
        .badge-medium { background: rgba(251,146,60,0.12); color: var(--orange); border: 1px solid rgba(251,146,60,0.2); }
        .badge-hard { background: rgba(248,113,113,0.12); color: var(--red); border: 1px solid rgba(248,113,113,0.2); }
        .badge-topic { background: rgba(124,109,250,0.12); color: var(--purple2); border: 1px solid rgba(124,109,250,0.2); }
        .table { width: 100%; border-collapse: collapse; }
        .table th { text-align: left; padding: 12px 16px; font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid var(--border); }
        .table td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid var(--border); color: var(--text2); }
        .table tr:hover td { background: rgba(124,109,250,0.04); color: var(--text); cursor: pointer; }
        .table tr:last-child td { border-bottom: none; }
        .progress-wrap { margin-bottom: 14px; }
        .progress-label { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: var(--text2); }
        .progress-track { background: var(--bg4); border-radius: 6px; height: 8px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 6px; transition: width 1s ease; }
        .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; font-family: inherit; }
        .btn-primary { background: linear-gradient(135deg,var(--purple),#5b4de8); color: #fff; box-shadow: 0 4px 16px rgba(124,109,250,0.3); }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,109,250,0.4); }
        .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border); }
        .btn-ghost:hover { border-color: var(--border2); color: var(--text); }
        .btn-green { background: linear-gradient(135deg,var(--green),#00b37a); color: #0a1a14; box-shadow: 0 4px 16px rgba(0,229,160,0.25); }
        .search-bar { display: flex; align-items: center; gap: 10px; background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; padding: 10px 14px; margin-bottom: 20px; }
        .search-bar input { background: none; border: none; outline: none; color: var(--text); font-family: inherit; font-size: 14px; flex: 1; }
        .search-bar input::placeholder { color: var(--text3); }
        .tabs { display: flex; gap: 4px; background: var(--bg3); border: 1px solid var(--border); border-radius: 10px; padding: 4px; margin-bottom: 20px; width: fit-content; flex-wrap: wrap; }
        .tab { padding: 7px 16px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; color: var(--text3); transition: all 0.2s; border: none; background: transparent; }
        .tab.active { background: var(--bg4); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
        .split { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .section-title { font-size: 16px; font-weight: 700; color: var(--text); }
        .section-sub { font-size: 13px; color: var(--text3); margin-top: 2px; }
        .activity-row { display: flex; align-items: flex-start; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .activity-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .code-area { background: #0d0d18; border: 1px solid var(--border); border-radius: 10px; padding: 16px; font-family: 'JetBrains Mono', monospace; font-size: 13px; line-height: 1.7; color: #a0a8c8; min-height: 200px; white-space: pre-wrap; }
        .timer-display { font-family: 'JetBrains Mono', monospace; font-size: 48px; font-weight: 700; color: var(--green); text-align: center; letter-spacing: 4px; padding: 20px 0; }
        .timer-danger { color: var(--red); animation: pulse 1s infinite; }
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .q-nav { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0; }
        .q-num { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); color: var(--text3); transition: all 0.2s; }
        .q-num.done { background: rgba(0,229,160,0.15); border-color: var(--green); color: var(--green); }
        .q-num.current { background: rgba(124,109,250,0.2); border-color: var(--purple); color: var(--purple2); }
        .problem-link { color: var(--text); font-weight: 500; }
        .problem-link:hover { color: var(--green); }
        .heatmap { display: flex; gap: 3px; flex-wrap: wrap; }
        .heat-cell { width: 12px; height: 12px; border-radius: 2px; }

        @media (max-width: 1060px) {
          .stats-grid, .grid-2, .grid-3, .split { grid-template-columns: 1fr; }
          .sidebar { position: static; width: 100%; min-height: auto; }
          .main { margin-left: 0; }
          .app { flex-direction: column; }
        }

        @media (max-width: 720px) {
          .content { padding: 16px; }
          .topbar { padding: 0 16px; }
          .sidebar-bottom { padding: 12px; }
          .stats-grid { gap: 12px; }
          .page-title { font-size: 15px; }
          .timer-display { font-size: 40px; }
        }
      `}</style>

      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-text">⚡ AlgoCoach</div>
            <div className="logo-sub">Interview Prep</div>
          </div>
          <div className="nav">
            {visibleNavSections.map((section) => (
              <div key={section.label}>
                <div className="nav-section">{section.label}</div>
                {section.items.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`nav-item ${activeItem === item.key ? 'active' : ''}`}
                    onClick={() => setActiveItem(item.key)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="sidebar-bottom">
            <div className="user-card">
              <div className="avatar">{initials}</div>
              <div>
                <div className="user-name">{displayName}</div>
                <div className="user-role">{user?.role || 'student'}</div>
              </div>
            </div>
          </div>
        </aside>

        <section className="main">
          <header className="topbar">
            <div className="page-title">{pageTitles[activeItem]}</div>
            <div className="topbar-right">
              <div className="streak-badge">🔥 {profileData?.stats?.streak || fallbackProfile.stats.streak} day streak</div>
              <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                {initials}
              </div>
            </div>
          </header>

          <div className="content">
            {loading ? <div className="card" style={{ minHeight: 'calc(100vh - 120px)' }} /> : null}
            {error ? <div className="card" style={{ color: 'var(--red)', marginBottom: '16px' }}>{error}</div> : null}

            <div className={`page ${activeItem === 'dashboard' ? 'active' : ''}`}>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{dashboardOverview.headline || `Hey ${displayName.split(' ')[0] || 'there'} 👋 Ready to grind?`}</div>
                <div style={{ color: 'var(--text3)', fontSize: '14px' }}>{dashboardOverview.subheadline || 'You\'re close to your weekly goal. Let\'s keep the momentum going.'}</div>
              </div>

              <div className="stats-grid">
                {dashboardStats.map((stat) => (
                  <div key={stat.label} className="stat-card">
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="stat-sub">{stat.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid-2" style={{ marginBottom: '20px' }}>
                <div className="card">
                  <div className="section-header">
                    <div>
                      <div className="section-title">Topic Progress</div>
                      <div className="section-sub">Keep pushing 💪</div>
                    </div>
                  </div>
                  {Object.entries(selectedTopicCount).map(([topic, progress]) => (
                    <div className="progress-wrap" key={topic}>
                      <div className="progress-label">
                        <span>{topic}</span>
                        <span style={{ color: progress > 70 ? 'var(--green)' : progress > 40 ? 'var(--orange)' : 'var(--pink)' }}>{progress}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%`, background: progress > 70 ? 'var(--green)' : progress > 40 ? 'var(--orange)' : 'var(--pink)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="section-header">
                    <div className="section-title">Quick Actions</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveItem('problems')}>🚀 Start Coding</button>
                    <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveItem('mock')}>🎯 Mock Interview</button>
                    <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setActiveItem('leaderboard')}>🏆 View Leaderboard</button>
                  </div>
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>Daily Challenge</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg4)', borderRadius: '10px', padding: '12px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedProblem?.title || 'Two Sum'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px' }}>{selectedProblem?.topic || 'Arrays'} · {selectedProblem?.difficulty || 'Medium'}</div>
                      </div>
                      <span className={`badge ${difficultyClass(selectedProblem?.difficulty)}`}>{selectedProblem?.difficulty || 'Medium'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="section-header">
                  <div className="section-title">Recent Activity</div>
                  <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setActiveItem('problems')}>View all →</button>
                </div>
                {overviewRecentActivity.map((item, index) => (
                  <div className="activity-row" key={`${item.title}-${index}`} style={index === overviewRecentActivity.length - 1 ? { borderBottom: 'none' } : undefined}>
                    <div className="activity-dot" style={{ background: item.status === 'Complete' ? 'var(--green)' : item.status === 'Ready' ? 'var(--purple2)' : 'var(--orange)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{item.description}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{item.status}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`page ${activeItem === 'problems' ? 'active' : ''}`}>
              <div className="search-bar">
                <span style={{ color: 'var(--text3)', fontSize: '16px' }}>🔍</span>
                <input placeholder="Search problems... e.g. Two Sum, Binary Tree" value={problemSearch} onChange={(event) => setProblemSearch(event.target.value)} />
                <select value={problemTopic} onChange={(event) => setProblemTopic(event.target.value)} style={{ background: 'var(--bg4)', border: 'none', color: 'var(--text2)', fontFamily: 'inherit', fontSize: '13px', outline: 'none' }}>
                  {topics.map((topic) => <option key={topic}>{topic}</option>)}
                </select>
              </div>
              <div className="tabs">
                {['All', 'Easy', 'Medium', 'Hard', 'Solved'].map((item) => (
                  <button key={item} type="button" className={`tab ${problemDifficulty === item ? 'active' : ''}`} onClick={() => setProblemDifficulty(item)}>
                    {item}
                  </button>
                ))}
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Topic</th>
                      <th>Difficulty</th>
                      <th>Companies</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProblems.map((problem, index) => (
                      <tr key={problem.id} onClick={() => openProblem(problem)}>
                        <td style={{ color: 'var(--text3)' }}>{index + 1}</td>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>
                          <span className="problem-link">{problem.title}</span>
                        </td>
                        <td><span className="badge badge-topic">{problem.topic}</span></td>
                        <td><span className={`badge ${difficultyClass(problem.difficulty)}`}>{problem.difficulty}</span></td>
                        <td style={{ color: 'var(--text3)', fontSize: '12px' }}>{problem.companies.join(', ')}</td>
                        <td>{problem.solved ? '✅' : '○'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`page ${activeItem === 'solve' ? 'active' : ''}`}>
              <div className="split">
                <div>
                  <div className="card" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{activeProblemDetail.title}</div>
                      <span className={`badge ${difficultyClass(activeProblemDetail.difficulty)}`}>{activeProblemDetail.difficulty}</span>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7, marginBottom: '14px' }}>{activeProblemDetail.description}</div>
                    {activeProblemDetail.examples.map((example, index) => (
                      <div key={index} style={{ background: 'var(--bg4)', borderRadius: '8px', padding: '12px', marginBottom: '10px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginBottom: '6px' }}>EXAMPLE</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--green)' }}>Input: {example.input}</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--purple2)' }}>Output: {example.output}</div>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-topic">{activeProblemDetail.companies[0] || 'Google'}</span>
                      <span className="badge badge-topic">{activeProblemDetail.companies[1] || 'Amazon'}</span>
                    </div>
                  </div>
                  <div className="card">
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--text2)' }}>💡 AI Hint</div>
                    <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.7, background: 'rgba(124,109,250,0.06)', border: '1px solid rgba(124,109,250,0.15)', borderRadius: '8px', padding: '12px' }}>
                      {hint || 'Think about using a HashMap to store numbers you have seen. For each element, check if its complement exists in the map.'}
                    </div>
                    <button className="btn btn-ghost" style={{ marginTop: '10px', fontSize: '12px', padding: '6px 12px' }} onClick={handleGetHint} disabled={hintLoading}>
                      {hintLoading ? 'Loading hint...' : 'Get next hint →'}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="card" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' }}>
                      <select value={selectedLanguage} onChange={(event) => setSelectedLanguage(event.target.value)} style={{ background: 'var(--bg4)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '13px', padding: '6px 10px', borderRadius: '8px', outline: 'none' }}>
                        {languageOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => setCodeByLanguage(createStarterMap(activeProblemDetail))}>Reset</button>
                        <button className="btn btn-green" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => handleRunCode(false)} disabled={isRunning}>{isRunning ? 'Running...' : '▶ Run'}</button>
                        <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => handleRunCode(true)} disabled={isRunning}>Submit</button>
                      </div>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                      <Editor
                        height="380px"
                        theme="vs-dark"
                        language={selectedLanguage}
                        value={currentCode}
                        onChange={(value) => updateCode(value)}
                        options={editorOptions}
                      />
                    </div>
                  </div>
                  <div className="card" style={{ borderColor: 'rgba(0,229,160,0.3)', background: 'rgba(0,229,160,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '18px' }}>✅</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)' }}>{runResult?.status || 'Accepted'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{runResult ? `${runResult.testCases?.length || 0} test cases evaluated` : 'All visible test cases passed'}</div>
                      </div>
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Runtime</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)' }}>{runResult?.runtime || '68ms'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                      {(runResult?.testCases || ['Case 1: Passed', 'Case 2: Passed', 'Case 3: Passed']).slice(0, 3).map((testCase, index) => (
                        <div key={`${testCase}-${index}`} style={{ background: 'var(--bg4)', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text3)' }}>CASE {index + 1}</div>
                          <div style={{ fontSize: '13px', color: 'var(--green)', marginTop: '2px' }}>{testCase}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`page ${activeItem === 'mock' ? 'active' : ''}`}>
              <div className="grid-2" style={{ marginBottom: '20px' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Time Remaining</div>
                  <div className={`timer-display ${mockSeconds < 300 ? 'timer-danger' : ''}`}>{formatSeconds(mockSeconds)}</div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={() => setMockRunning((value) => !value)}>{mockRunning ? '⏸ Pause' : '▶ Resume'}</button>
                    <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={() => setMockSeconds(mockSession?.durationSeconds || fallbackMockSession.durationSeconds)}>🔄 Reset</button>
                  </div>
                </div>
                <div className="card">
                  <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '8px' }}>Question Progress</div>
                  <div className="q-nav">
                    <div className="q-num done">1</div>
                    <div className="q-num done">2</div>
                    <div className="q-num current">3</div>
                    {Array.from({ length: Math.max(0, (mockSession?.questionCount || 5) - 3) }).map((_, index) => (
                      <div key={index} className="q-num">{index + 4}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text3)' }}>Overall Progress</span><span style={{ color: 'var(--green)' }}>2/{mockSession?.questionCount || 5}</span>
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round((2 / (mockSession?.questionCount || 5)) * 100)}%`, background: 'var(--green)' }} /></div>
                  </div>
                  <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}>← Prev</button>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '13px' }}>Next →</button>
                  </div>
                </div>
              </div>
              <div className="split">
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>Q3 · {mockQuestion.title}</div>
                    <span className={`badge ${difficultyClass(mockQuestion.difficulty)}`}>{mockQuestion.difficulty}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text2)', lineHeight: 1.7 }}>{mockQuestion.prompt}</div>
                  <div style={{ background: 'var(--bg4)', borderRadius: '8px', padding: '12px', marginTop: '12px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--green)' }}>Input: {mockQuestion.exampleInput}</div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--purple2)' }}>Output: {mockQuestion.exampleOutput}</div>
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-ghost" style={{ fontSize: '12px', width: '100%', justifyContent: 'center' }}>🚫 No AI hints in Mock Mode</button>
                  </div>
                </div>
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <select style={{ background: 'var(--bg4)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'inherit', fontSize: '13px', padding: '6px 10px', borderRadius: '8px', outline: 'none' }}>
                      <option>Python</option>
                      <option>JavaScript</option>
                    </select>
                    <button className="btn btn-green" style={{ padding: '7px 14px', fontSize: '12px' }}>▶ Run</button>
                  </div>
                  <div className="code-area">{mockEditorCode}</div>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>🏁 Submit All &amp; Finish</button>
                </div>
              </div>
            </div>

            <div className={`page ${activeItem === 'leaderboard' ? 'active' : ''}`}>
              <div className="tabs">
                <button type="button" className="tab active">This Week</button>
                <button type="button" className="tab">This Month</button>
                <button type="button" className="tab">All Time</button>
              </div>
              <div className="grid-3" style={{ marginBottom: '24px' }}>
                {leaderboardSlice.map((entry, index) => {
                  const rank = index + 1;
                  const isWinner = rank === 1;
                  const isTop = rank === 2;
                  const rankClass = isWinner ? 'rank-1' : isTop ? 'rank-2' : 'rank-3';

                  return (
                    <div key={entry.id} className={`card lead-card ${rankClass}`} style={isWinner ? { transform: 'scale(1.03)' } : undefined}>
                      <div style={{ fontSize: '28px' }}>{isWinner ? '👑' : isTop ? '🥈' : '🥉'}</div>
                      <div className="avatar" style={{ width: isWinner ? '60px' : '52px', height: isWinner ? '60px' : '52px', fontSize: isWinner ? '22px' : '18px', margin: '12px auto', background: isWinner ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : 'linear-gradient(135deg,var(--purple),var(--green))' }}>
                        {getInitials(entry.name)}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: isWinner ? '16px' : '14px', marginBottom: '4px' }}>{entry.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text3)' }}>{entry.college}</div>
                      <div style={{ fontSize: isWinner ? '26px' : '22px', fontWeight: 700, color: isWinner ? '#fbbf24' : isTop ? 'var(--purple2)' : 'var(--orange)', marginTop: '10px' }}>{entry.score}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>points</div>
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="table">
                  <thead>
                    <tr><th>Rank</th><th>Student</th><th>College</th><th>Solved</th><th>Streak</th><th>Points</th></tr>
                  </thead>
                  <tbody>
                    {leaderboardData.map((entry, index) => (
                      <tr key={entry.id} style={entry.name.includes(displayName.split(' ')[0]) ? { background: 'rgba(124,109,250,0.06)', border: '1px solid rgba(124,109,250,0.2)' } : undefined}>
                        <td style={{ color: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#fb923c' : 'var(--text3)', fontWeight: 700 }}>{index < 3 ? ['🥇', '🥈', '🥉'][index] : ''} {index + 1}</td>
                        <td style={{ fontWeight: 500, color: 'var(--text)' }}>{entry.name}{entry.name.includes(displayName.split(' ')[0]) ? ' (You)' : ''}</td>
                        <td style={{ color: 'var(--text3)' }}>{entry.college}</td>
                        <td>{entry.problemsSolved}</td>
                        <td style={{ color: 'var(--orange)' }}>{entry.streak}🔥</td>
                        <td style={{ fontWeight: 700, color: 'var(--purple2)' }}>{entry.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`page ${activeItem === 'profile' ? 'active' : ''}`}>
              <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg,rgba(124,109,250,0.1),rgba(0,229,160,0.05))', borderColor: 'rgba(124,109,250,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div className="avatar" style={{ width: '72px', height: '72px', fontSize: '26px' }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '22px', fontWeight: 700 }}>{profileUser.name || displayName}</div>
                    <div style={{ color: 'var(--text3)', fontSize: '14px', marginTop: '4px' }}>📍 {profileUser.college || 'AlgoCoach'} · Batch {profileUser.batch || 'N/A'}</div>
                    <div style={{ color: 'var(--text3)', fontSize: '13px', marginTop: '4px' }}>✉️ {profileUser.email || user?.email || 'Not available'}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <span className="badge badge-topic" style={{ textTransform: 'capitalize' }}>{profileUser.role || 'student'}</span>
                      <span style={{ fontSize: '12px', background: 'rgba(251,146,60,0.12)', color: 'var(--orange)', border: '1px solid rgba(251,146,60,0.2)', padding: '3px 10px', borderRadius: '20px' }}>🔥 {profileData.stats?.streak || 7} day streak</span>
                    </div>
                  </div>
                  <button className="btn btn-ghost" style={{ fontSize: '13px' }}>Edit Profile</button>
                </div>
              </div>
              <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card"><div className="stat-label">Solved</div><div className="stat-value" style={{ color: 'var(--green)' }}>{profileData.stats?.solved || 142}</div></div>
                <div className="stat-card"><div className="stat-label">Rank</div><div className="stat-value" style={{ color: 'var(--purple2)' }}>#{profileData.stats?.rank || 12}</div></div>
                <div className="stat-card"><div className="stat-label">Accuracy</div><div className="stat-value" style={{ color: 'var(--orange)' }}>{profileData.stats?.accuracy || 78}%</div></div>
                <div className="stat-card"><div className="stat-label">Best Streak</div><div className="stat-value" style={{ color: 'var(--pink)' }}>{profileData.stats?.streak || 7}🔥</div></div>
              </div>
              <div className="grid-2">
                <div className="card">
                  <div className="section-title" style={{ marginBottom: '16px' }}>Solved Breakdown</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e30" strokeWidth="16" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#00e5a0" strokeWidth="16" strokeDasharray="100 152" strokeDashoffset="0" transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#fb923c" strokeWidth="16" strokeDasharray="62 190" strokeDashoffset="-100" transform="rotate(-90 50 50)" />
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#f87171" strokeWidth="16" strokeDasharray="40 212" strokeDashoffset="-162" transform="rotate(-90 50 50)" />
                      <text x="50" y="55" textAnchor="middle" fill="#e2e0ff" fontSize="14" fontWeight="700" fontFamily="Space Grotesk">{profileData.stats?.solved || 142}</text>
                    </svg>
                    <div>
                      {Object.entries(difficultyBreakdown).map(([key, value]) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: key === 'easy' ? 'var(--green)' : key === 'medium' ? 'var(--orange)' : 'var(--red)' }} />
                          <span style={{ fontSize: '13px', textTransform: 'capitalize' }}>{key}: {value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="section-title" style={{ marginBottom: '16px' }}>Achievements 🏅</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {(profileData.badges || fallbackProfile.badges).map((badge, index) => (
                      <div key={badge} style={{ background: index === 3 ? 'rgba(124,109,250,0.08)' : 'var(--bg4)', border: index === 3 ? '1px dashed rgba(124,109,250,0.3)' : 'none', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '22px' }}>{['🎯', '🔥', '💪', '🔒'][index] || '🏅'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{badge}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card" style={{ marginTop: '20px' }}>
                <div className="section-title" style={{ marginBottom: '16px' }}>Heatmap</div>
                <div className="heatmap">
                  {Array.from({ length: 84 }).map((_, index) => {
                    const intensity = index % 5;
                    const shades = ['#1e1e30', '#242443', '#2f2f56', '#3d3a60', '#00e5a0'];
                    return <div key={index} className="heat-cell" style={{ background: shades[intensity] }} />;
                  })}
                </div>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '20px' }}>
                <table className="table">
                  <thead>
                    <tr><th>Problem</th><th>Topic</th><th>Status</th><th>Runtime</th><th>Submitted</th></tr>
                  </thead>
                  <tbody>
                    {(profileData.submissions || fallbackProfile.submissions).map((submission) => (
                      <tr key={submission.id}>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{submission.problem}</td>
                        <td style={{ color: 'var(--text3)' }}>{submission.topic}</td>
                        <td><span className={`badge ${submission.status === 'Accepted' ? 'badge-easy' : 'badge-hard'}`}>{submission.status}</span></td>
                        <td>{submission.runtime}</td>
                        <td style={{ color: 'var(--text3)' }}>{submission.submittedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`page ${activeItem === 'admin' ? 'active' : ''}`}>
              {!isAdmin ? (
                <div className="card" style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700 }}>Admin access required</div>
                  <div style={{ color: 'var(--text3)' }}>This section is only visible to admin users.</div>
                  <button className="btn btn-primary" style={{ width: 'fit-content' }} onClick={() => setActiveItem('dashboard')}>Back to dashboard</button>
                </div>
              ) : (
                <>
                  <div className="stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="stat-card"><div className="stat-label">Total Students</div><div className="stat-value" style={{ color: 'var(--purple2)' }}>{adminKpis.totalStudents}</div><div className="stat-sub">↑ 12 this week</div></div>
                    <div className="stat-card"><div className="stat-label">Active Today</div><div className="stat-value" style={{ color: 'var(--green)' }}>{adminKpis.activeToday}</div><div className="stat-sub">36% daily active</div></div>
                    <div className="stat-card"><div className="stat-label">Avg Score</div><div className="stat-value" style={{ color: 'var(--orange)' }}>{adminKpis.avgScore}%</div><div className="stat-sub">↑ 3% this month</div></div>
                    <div className="stat-card"><div className="stat-label">Submissions</div><div className="stat-value" style={{ color: 'var(--pink)' }}>{Math.round(adminKpis.totalSubmissions / 1000)}k</div><div className="stat-sub">Last 7 days</div></div>
                  </div>
                  <div className="grid-2" style={{ marginBottom: '20px' }}>
                    <div className="card">
                      <div className="section-title" style={{ marginBottom: '16px' }}>Submissions (Last 7 Days)</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                        {adminSubmissionSeries.map((value, index) => (
                          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <div style={{ background: index === 4 ? 'var(--green)' : 'var(--purple)', borderRadius: '4px 4px 0 0', width: '100%', height: `${Math.max(35, Math.round((value / Math.max(...adminSubmissionSeries)) * 100))}px` }} />
                            <div style={{ fontSize: '10px', color: 'var(--text3)' }}>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card">
                      <div className="section-title" style={{ marginBottom: '16px' }}>Top Activity</div>
                      {adminRecentActivity.map((item) => (
                        <div key={item.id} className="activity-row">
                          <div className="activity-dot" style={{ background: 'var(--green)' }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.text}</div>
                          </div>
                          <span className="badge badge-topic">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600 }}>All Students</div>
                      <button className="btn btn-primary" style={{ fontSize: '12px', padding: '7px 14px' }}>+ Add Student</button>
                    </div>
                    <table className="table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Batch</th><th>Solved</th><th>Last Active</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {adminStudents.map((student) => (
                          <tr key={student.id}>
                            <td style={{ color: 'var(--text)', fontWeight: 500 }}>{student.name}</td>
                            <td style={{ color: 'var(--text3)' }}>{student.email}</td>
                            <td>{student.batch}</td>
                            <td style={{ color: 'var(--green)' }}>{student.problemsSolved}</td>
                            <td style={{ color: 'var(--text3)' }}>{student.lastActive}</td>
                            <td><button className="btn btn-ghost" style={{ fontSize: '11px', padding: '4px 10px' }}>View</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;