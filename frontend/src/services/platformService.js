import { pythonAPI } from './api';

export const fetchProblemCatalog = async () => {
  const res = await pythonAPI.get('/problems/catalog');
  return res.data?.problems || [];
};

export const fetchProblemDetail = async (slug) => {
  if (!slug) {
    return null;
  }

  const res = await pythonAPI.get(`/problems/${slug}`);
  return res.data;
};

export const fetchHint = async ({ problem, code, language }) => {
  const res = await pythonAPI.post('/api/hint', {
    problem,
    code,
    language,
  });

  return res.data;
};

export const runCode = async ({ problem, code, language, submit = false }) => {
  const res = await pythonAPI.post('/api/run-code', {
    problem,
    code,
    language,
    submit,
  });

  return res.data;
};

export const fetchProfileOverview = async () => {
  const res = await pythonAPI.get('/profile/overview');
  return res.data;
};

export const fetchLeaderboard = async () => {
  const res = await pythonAPI.get('/leaderboard');
  return res.data?.leaderboardData || [];
};

export const fetchAdminDashboard = async () => {
  const res = await pythonAPI.get('/admin/dashboard');
  return res.data?.adminData || null;
};

export const fetchMockSession = async () => {
  const res = await pythonAPI.get('/mock/session');
  return res.data || null;
};