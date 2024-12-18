"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { checkIfUserExists, addToDb, getUserAccountType } from '@/firebase-configuration/firebaseDatabase';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase-configuration/firebaseAuth';

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email;
        if (email?.includes('cgps.org')) {
          console.log('User is part of CGPS domain');

          // Check if user is in Firestore database
          const userExists = await checkIfUserExists(email);

          // If not, add user to database
          if (!userExists) {
            if (user.email && user.uid && user.displayName && user.photoURL) {
              await addToDb(user.email, user.uid, user.displayName, user.photoURL);
            } else {
              console.error('User does not have all required information');
            }
          }

          // Get user account type
          const accountType = await getUserAccountType(email);
          setAccountType(accountType);
          setUser(user);
        } else {
          console.error('You must sign in with a CGPS email');
          await signOut(auth);
          alert('You must sign in with a CGPS email');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  const authWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

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