import axios from 'axios';

// 🛰️ DYNAMIC ENDPOINT CONFIGURATION
const isLocalHost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' || 
                      window.location.hostname.startsWith('192.168.') || 
                      window.location.hostname.startsWith('10.') ||
                      window.location.hostname.startsWith('172.');

export const API_BASE_URL = isLocalHost ? window.location.origin : 'https://hrm1.onrender.com';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:')) return path; // Base64 fallback
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  
  const normalized = path.replace(/\\/g, '/');
  const cleanPath = normalized.startsWith('/') ? normalized : `/${normalized}`;
  
  const isLocalHost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname.startsWith('192.168.') || 
                        window.location.hostname.startsWith('10.') ||
                        window.location.hostname.startsWith('172.');
  
  const base = isLocalHost ? 'https://hrm1.onrender.com' : '';
  return `${base}${cleanPath}`;
};

export default api;
