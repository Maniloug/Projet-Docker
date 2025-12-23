import axios from 'axios';

const SESSION_KEY = 'poke-session-id';

function ensureSessionId() {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  config.headers['x-session-id'] = ensureSessionId();
  return config;
});

export default http;
