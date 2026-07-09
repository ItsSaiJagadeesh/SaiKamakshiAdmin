import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from "@/lib/firebaseconfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check for root admin first
          if (firebaseUser.email === 'srisaikamakshimetalworks.jrg@gmail.com') {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: 'Root Admin',
              role: 'root_admin'
            });
            setIsLoading(false);
            return;
          }

          // Otherwise check firestore users collection for 'admin' role
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.role === 'admin') {
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: data.name || 'Admin',
                role: 'admin'
              });
            } else {
              // Not an admin
              console.warn("User does not have admin role.");
              await signOut(auth);
              setUser(null);
            }
          } else {
            // No user doc
            console.warn("No user document found.");
            await signOut(auth);
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user role", error);
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
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
