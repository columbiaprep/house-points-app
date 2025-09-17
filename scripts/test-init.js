// Simple test script to initialize aggregated collections
// Run this with: node scripts/test-init.js

const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable, connectFunctionsEmulator } = require('firebase/functions');

// Your Firebase config - replace with your actual config
const firebaseConfig = {
  // Copy your Firebase config from firebase-configuration/firebaseApp.ts
  // Or use environment variables
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

async function initializeAggregatedData() {
  try {
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const functions = getFunctions(app);
    
    // Uncomment if using emulator
    // connectFunctionsEmulator(functions, "localhost", 5001);
    
    console.log('📞 Calling initializeAggregatedCollections...');
    const initializeFunction = httpsCallable(functions, 'initializeAggregatedCollections');
    
    const result = await initializeFunction();
    
    console.log('✅ Success! Result:');
    console.log(JSON.stringify(result.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Set your Firebase config as environment variables or replace firebaseConfig above
if (!firebaseConfig.projectId) {
  console.log(`
⚠️  Please set your Firebase configuration:

Option 1: Set environment variables:
export FIREBASE_PROJECT_ID=your-project-id
export FIREBASE_API_KEY=your-api-key
# ... etc

Option 2: Edit this file and replace firebaseConfig object with your actual config

Then run: node scripts/test-init.js
`);
} else {
  initializeAggregatedData();
}