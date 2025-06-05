// API configuration for backend communication
import { Platform } from 'react-native';

// For React Native, localhost doesn't work on device/simulator
const getApiUrl = () => {
  if (!__DEV__) {
    return 'https://your-api-domain.com/api';
  }
  
  // Development URLs
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api';  // Android emulator
  }
  
  // For iOS simulator and Expo Go, localhost should work
  // If it doesn't, replace with your machine's IP: 'http://192.168.1.xxx:4000/api'
  return 'http://localhost:4000/api';
};

const API_BASE_URL = getApiUrl();

// Debug log
console.log('API Base URL:', API_BASE_URL);

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    TASKS: '/tasks',
    LLM: '/llm',
    HEALTH: '/health',
  },
  TIMEOUT: 10000,
};

// API client functions
export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },

  post: async (endpoint: string, data?: any) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return response.json();
  },

  put: async (endpoint: string, data?: any) => {
    console.log('PUT request to:', `${API_CONFIG.BASE_URL}${endpoint}`, 'with data:', data);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    console.log('PUT response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('PUT error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('PUT result:', result);
    return result;
  },

  delete: async (endpoint: string) => {
    console.log('DELETE request to:', `${API_CONFIG.BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('DELETE response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('DELETE error:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    // DELETE might return 204 No Content
    if (response.status === 204) {
      console.log('DELETE successful (204)');
      return null;
    }
    
    const result = await response.json();
    console.log('DELETE result:', result);
    return result;
  },
};

export default API_CONFIG;