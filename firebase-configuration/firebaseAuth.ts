"use client"
import { GoogleAuthProvider, signInWithRedirect, onAuthStateChanged, signOut, User, getAuth } from 'firebase/auth';
import { app } from './firebaseAppClient';

const auth = getAuth(app);

export const authWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
};

export const handleAuthStateChange = (onUserAuthenticated: (user: User | null) => void) => {
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

export { auth };