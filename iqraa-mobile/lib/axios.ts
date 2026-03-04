import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Expo automatically loads variables starting with EXPO_PUBLIC_
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  console.error("❌ EXPO_PUBLIC_API_URL is missing from .env file!");
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Token Interceptor (Exactly like Web, but using SecureStore)
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error reading token:", error);
  }
  return config;
});

// Add Response Interceptor (Handle 401s globally)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Logic to logout user or refresh token
      await SecureStore.deleteItemAsync('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api;