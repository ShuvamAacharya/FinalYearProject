import { create } from 'zustand';
import axios from '../api/axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar: string;
  instructorEligible?: boolean;
  performanceMetrics?: {
    totalQuizzesTaken: number;
    averageScore: number;
    totalPointsEarned: number;
    averageCompletionTime: number;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    try {
      set({ loading: true });
      const { data } = await axios.post('/auth/login', { email, password });
      
      console.log('Login response:', data);
      
      localStorage.setItem('token', data.token);
      set({ 
        token: data.token, 
        user: data.user, 
        loading: false 
      });
      
      toast.success('Login successful!');
      
      // Force redirect using window.location
      console.log('Forcing redirect for role:', data.user.role);
      
      setTimeout(() => {
        if (data.user.role === 'student') {
          window.location.href = '/student/dashboard';
        } else if (data.user.role === 'teacher') {
          window.location.href = '/teacher/dashboard';
        } else if (data.user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        }
      }, 100);
      
    } catch (error: any) {
      set({ loading: false });
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  },

  register: async (name, email, password, role) => {
    try {
      set({ loading: true });
      const { data } = await axios.post('/auth/register', { 
        name, 
        email, 
        password, 
        role 
      });
      
      console.log('Register response:', data);
      
      localStorage.setItem('token', data.token);
      set({ 
        token: data.token, 
        user: data.user, 
        loading: false 
      });
      
      toast.success('Registration successful!');
      
      // Force redirect using window.location
      console.log('Forcing redirect for role:', data.user.role);
      
      setTimeout(() => {
        if (data.user.role === 'student') {
          window.location.href = '/student/dashboard';
        } else if (data.user.role === 'teacher') {
          window.location.href = '/teacher/dashboard';
        } else if (data.user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        }
      }, 100);
      
    } catch (error: any) {
      set({ loading: false });
      console.error('Register error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
    toast.success('Logged out successfully');
    window.location.href = '/login';
  },

  fetchUser: async () => {
    try {
      console.log('Fetching user data...');
      const { data } = await axios.get('/auth/me');
      console.log('User data received:', data);
      set({ user: data.user });
    } catch (error: any) {
      console.error('Fetch user error:', error.response?.data || error.message);
      localStorage.removeItem('token');
      set({ token: null, user: null });
    }
  },
}));