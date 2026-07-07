import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Named API groups
export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
};

export const prospectsAPI = {
  list: (params = {}) =>
    api.get('/api/prospects/', { params }),
  get: (id) => api.get(`/api/prospects/${id}`),
  score: (data) => api.post('/api/prospects/score', data),
};

export const outreachAPI = {
  generate: (prospectId, language = 'english') =>
    api.get(`/api/outreach/generate/${prospectId}?language=${language}`),
  generateLive: (data) =>
    api.post('/api/outreach/generate', data),
};

export const analyticsAPI = {
  dashboard: () => api.get('/api/analytics/dashboard'),
  funnel: () => api.get('/api/analytics/funnel'),
};

// Convenience helpers used directly by pages
export const login = async (email, password) => {
  const res = await authAPI.login(email, password);
  return res.data;
};

export const getDashboard = async () => {
  const res = await analyticsAPI.dashboard();
  return res.data;
};

export const getFunnel = async () => {
  const res = await analyticsAPI.funnel();
  return res.data;
};

export const getProspects = async (params = {}) => {
  const res = await prospectsAPI.list(params);
  // API returns list directly; wrap for pages that expect { prospects: [] }
  const data = res.data;
  return Array.isArray(data) ? { prospects: data } : data;
};

export const scoreProspect = async (data) => {
  const res = await prospectsAPI.score(data);
  return res.data;
};

export default api;
