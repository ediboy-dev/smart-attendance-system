import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Automatically attach the JWT to every outgoing request, if one exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Attach a simple per-browser device fingerprint used for duplicate-scan detection
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'device-' + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem('deviceId', deviceId);
  }
  config.headers['x-device-id'] = deviceId;
  return config;
});

export default api;
