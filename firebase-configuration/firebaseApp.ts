"use client";
import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "@firebase/firestore";
import { setLogLevel } from "@firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Suppress Firestore debug logs in production to reduce noise from idle stream timeouts
if (process.env.NODE_ENV === 'production') {
    setLogLevel('error');
} else {
    // In development, suppress only debug logs but keep warnings/errors
    setLogLevel('warn');
}

export { db, auth };
export default app;
