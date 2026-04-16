import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('kom_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

export const login = async (credentials) => {
  const r = await api.post('/api/auth/login', credentials);
  if (r.data.success) {
    localStorage.setItem('kom_token', r.data.tokens.access);
    localStorage.setItem('kom_user', JSON.stringify(r.data.user.userDetails));
  }
  return r.data;
};

export const logout = () => {
  localStorage.removeItem('kom_token');
  localStorage.removeItem('kom_user');
};

export const getUser = () => {
  const u = localStorage.getItem('kom_user');
  return u ? JSON.parse(u) : null;
};

export const isAuthenticated = () => !!localStorage.getItem('kom_token');
