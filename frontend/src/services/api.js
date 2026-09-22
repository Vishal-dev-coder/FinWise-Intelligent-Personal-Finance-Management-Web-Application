import axios from 'axios';

const getBaseURL = () => {
  let url = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim();
  // Strip markdown formatting if accidentally pasted as [url](url)
  const mdMatch = url.match(/\((https?:\/\/[^\s)]+)\)/);
  if (mdMatch) {
    url = mdMatch[1];
  }
  // Remove trailing slashes
  url = url.replace(/\/+$/, '');
  // Ensure /api is appended if missing
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle expired tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirect loops if checking /auth/me or logging in
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('finwise_token');
        localStorage.removeItem('finwise_user');
        window.location.href = '/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

// Offline Queue Support
export const queueOfflineTransaction = (transactionData) => {
  const queue = JSON.parse(localStorage.getItem('finwise_offline_queue') || '[]');
  queue.push({
    ...transactionData,
    offlineQueuedAt: new Date().toISOString(),
  });
  localStorage.setItem('finwise_offline_queue', JSON.stringify(queue));
};

export const syncOfflineTransactions = async () => {
  const queue = JSON.parse(localStorage.getItem('finwise_offline_queue') || '[]');
  if (!queue.length) return { synced: 0 };

  let count = 0;
  const remaining = [];

  for (const item of queue) {
    try {
      await API.post('/transactions', item);
      count++;
    } catch (err) {
      console.error('Failed to sync offline transaction', err);
      remaining.push(item);
    }
  }

  localStorage.setItem('finwise_offline_queue', JSON.stringify(remaining));
  return { synced: count, remaining: remaining.length };
};

export default API;
