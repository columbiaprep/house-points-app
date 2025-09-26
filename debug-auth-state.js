// Debug script to check Firebase auth state
const { initializeApp } = require('firebase/app');
const { getAuth, onAuthStateChanged, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBoVvoAbcy1bdU1W_s35rvfogG4jwBGVAA",
    authDomain: "house-points-app-e7c49.firebaseapp.com",
    projectId: "house-points-app-e7c49",
    storageBucket: "house-points-app-e7c49.firebasestorage.app",
    messagingSenderId: "495897903470",
    appId: "1:495897903470:web:0cb9540cfe58912632c17f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('Firebase app initialized');
console.log('Auth config:', {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId
});

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', {
        user: user ? user.email : null,
        uid: user ? user.uid : null,
        emailVerified: user ? user.emailVerified : null,
        isAnonymous: user ? user.isAnonymous : null
    });
});

setTimeout(() => {
    console.log('Current auth state after 2 seconds:', {
        currentUser: auth.currentUser ? auth.currentUser.email : null,
        authReady: auth.currentUser !== undefined
    });
}, 2000);

// Keep the script running for a bit to see auth state changes
setTimeout(() => {
    console.log('Exiting...');
    process.exit(0);
}, 5000);