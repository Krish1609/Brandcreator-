import axios from 'axios';

let rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim();
rawApiUrl = rawApiUrl.replace(/\/+$/, '');
if (!rawApiUrl.endsWith('/api')) {
  rawApiUrl = `${rawApiUrl}/api`;
}

if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && rawApiUrl.includes('localhost')) {
  console.warn('⚠️ NEXT_PUBLIC_API_URL is pointing to localhost while running on a deployed domain! Please configure NEXT_PUBLIC_API_URL in your Vercel/hosting environment settings and redeploy.');
}

const api = axios.create({
  baseURL: rawApiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000 // 45s timeout to accommodate Render free-tier cold starts
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
