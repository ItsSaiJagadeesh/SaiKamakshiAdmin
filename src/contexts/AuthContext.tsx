import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from "@/lib/firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials for testing (will be replaced with Lovable Cloud auth)
const DEMO_ADMIN = {
  email: 'admin@saikamakshi.com',
  password: 'admin123',
  user: {
    id: '1',
    email: 'admin@saikamakshi.com',
    name: 'Admin',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      setUser(DEMO_ADMIN.user);
      localStorage.setItem('admin_user', JSON.stringify(DEMO_ADMIN.user));
    } else {
      throw new Error('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    localStorage.removeItem('admin_user');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
