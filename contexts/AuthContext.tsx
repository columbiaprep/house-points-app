import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import app from '@/firebase-configuration/firebaseApp';
import { checkIfUserExists, addToDb } from '@/firebase-configuration/firebaseDatabase';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOutUser }}>
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