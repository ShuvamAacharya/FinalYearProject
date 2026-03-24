import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Base URL
axios.defaults.baseURL = "http://localhost:5000";

// Attach JWT token automatically
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged in user
  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    fetchUser();
  } else {
    setLoading(false);
  }
}, []);

    // Register
      const register = async (
        name: string,
        email: string,
        password: string,
        role?: string
      ) => {
        const res = await axios.post("/api/auth/register", {
          name,
          email,
          password,
          role,
        });

        localStorage.setItem("token", res.data.token);

        const newUser = res.data.user as User;
        setUser(newUser);
        return newUser;
      };

  const login = async (email: string, password: string) => {
    const res = await axios.post("/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    const loggedIn = res.data.user as User;
    setUser(loggedIn);
    return loggedIn;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};