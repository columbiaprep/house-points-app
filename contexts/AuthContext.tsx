"use client"
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider, User, getRedirectResult, signInWithRedirect } from 'firebase/auth';
import { auth } from '@/firebase-configuration/firebaseAuth';
import { getUserAccountType } from '@/firebase-configuration/firebaseDatabase';

interface AuthContextType {
  user: User | null;
  accountType: string | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  authWithGoogle: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      
      console.log("Auth state changed");
      if (user) {
        console.log("User authenticated:", user);
        setUser(user);
        if (user.email) {
          const accountType = await getUserAccountType(user.email);
          setAccountType(accountType);
        }
      } else {
        setUser(null);
        setAccountType(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const signOutUser = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setAccountType(null);
  };

  const authWithGoogle = async () => {
    window.localStorage.setItem('signInInProgress', 'true');
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    
}

  return (
    <AuthContext.Provider value={{ user, accountType, loading, signOutUser, authWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};