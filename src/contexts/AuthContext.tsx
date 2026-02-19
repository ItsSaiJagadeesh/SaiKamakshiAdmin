 import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
 import { AdminUser, mockAdmin } from '@/lib/mock-data';
 
 interface AuthContextType {
   user: AdminUser | null;
   isAuthenticated: boolean;
   isLoading: boolean;
   login: (email: string, password: string) => Promise<boolean>;
   logout: () => void;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export function AuthProvider({ children }: { children: ReactNode }) {
   const [user, setUser] = useState<AdminUser | null>(() => {
     // Check for persisted session
     const stored = localStorage.getItem('admin_session');
     if (stored) {
       try {
         return JSON.parse(stored);
       } catch {
         return null;
       }
     }
     return null;
   });
   const [isLoading, setIsLoading] = useState(false);
 
   const login = useCallback(async (email: string, password: string): Promise<boolean> => {
     setIsLoading(true);
     
     // Simulate API call delay
     await new Promise(resolve => setTimeout(resolve, 1000));
     
     // Mock authentication - in production, this would call Firebase Auth
     if (email === 'admin@snigdhawomensworld.com' && password === 'admin123') {
       const adminUser = { ...mockAdmin, lastLoginAt: new Date().toISOString() };
       setUser(adminUser);
       localStorage.setItem('admin_session', JSON.stringify(adminUser));
       setIsLoading(false);
       return true;
     }
     
     setIsLoading(false);
     return false;
   }, []);
 
   const logout = useCallback(() => {
     setUser(null);
     localStorage.removeItem('admin_session');
   }, []);
 
   return (
     <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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