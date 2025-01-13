'use client';
import { onAuthStateChanged, signOut, User } from '@firebase/auth';

import { auth } from './firebaseAppClient';

export const handleAuthStateChange = (
  onUserAuthenticated: (user: User | null) => void,
) => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      onUserAuthenticated(user);
    } else {
      onUserAuthenticated(null);
    }
  });
};

export const signOutUser = async () => {
  await signOut(auth);
};
