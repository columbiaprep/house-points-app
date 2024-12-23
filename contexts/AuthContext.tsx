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
  const [authAttempted, setAuthAttempted] = useState<boolean>(false);

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

  useEffect(() => {
    if (!loading && !authAttempted && (!user || !accountType)) {
      console.log("Prompting login with Google");
      authWithGoogle();
      setAuthAttempted(true);
    }
  }, [loading, user, accountType, authAttempted]);

  const signOutUser = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null);
    setAccountType(null);
    window.location.reload();
  };

  const authWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log(user)
        setUser(result.user);
      }
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error("Error authenticating with Google:", errorCode, errorMessage, email, credential);
    });
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