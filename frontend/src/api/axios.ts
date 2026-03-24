import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Add token to every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', error.response || error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect here, let components handle it
    }
    return Promise.reject(error);
  }
);

export default instance;