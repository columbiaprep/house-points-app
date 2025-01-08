"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from '@firebase/auth';
import { checkIfUserExists, addToDb, getUserAccountType } from '@/firebase-configuration/firebaseDatabase';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase-configuration/firebaseAppClient';

interface AuthContextType {
  user: User | null;
  accountType: string | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  authWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const accountType = user.email ? await getUserAccountType(user.email) : null;
        setAccountType(accountType);
        setLoading(false);
      } else {
        setUser(null);
        setAccountType(null);
        setLoading(false);
        router.push('/auth')
      }
    });
    setLoading(false);
    return () => unsubscribe();
  }, []);

  const signOutUser = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setAccountType(null);
    setLoading(false);
    router.push('/auth')
  };

  const authWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    const user = auth.currentUser;
    if (user) {
      const exists = user.email ? await checkIfUserExists(user.email) : false;
      if (!exists) {
        if (user.email) {
          await addToDb(user.email, user.uid, user.displayName || '', user.photoURL || '');
        }
      }
    }
    setUser(user);
    router.push('/dashboard');
  };


  return (
    <AuthContext.Provider value={{ user, accountType, loading, authWithGoogle, signOutUser }}>
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