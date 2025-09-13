/**
 * Initialization script to set up aggregated collections
 * Run this once after deploying Firebase Functions
 */

import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { initializeApp } from "firebase/app";

// Your Firebase config (you may want to load this from environment)
const firebaseConfig = {
    // Add your Firebase config here, or import from your existing config
    // This should match your firebase-configuration/firebaseApp.ts
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Uncomment this if you're using the Firebase emulator
// connectFunctionsEmulator(functions, "localhost", 5001);

export async function initializeAggregatedData() {
    try {
        console.log("🚀 Initializing aggregated collections...");
        
        const initializeFunction = httpsCallable(functions, "initializeAggregatedCollections");
        const result = await initializeFunction();
        
        console.log("✅ Successfully initialized aggregated collections:");
        console.log(result.data);
        
        return result.data;
    } catch (error) {
        console.error("❌ Error initializing aggregated collections:", error);
        throw error;
    }
}

// Script runner (uncomment to run directly)
/*
if (require.main === module) {
    initializeAggregatedData()
        .then(() => {
            console.log("🎉 Initialization complete!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Initialization failed:", error);
            process.exit(1);
        });
}
*/