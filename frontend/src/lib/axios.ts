import axios from 'axios';

/**
 * Configured Axios instance for making API requests.
 * Sets the base URL and default headers.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to attach the JWT token to requests.
 * Checks for a token in localStorage and adds it to the Authorization header.
 */
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;