/**
 * Database cleanup script to fix existing issues:
 * 1. Fix houseRankings collection records with color names instead of house names
 * 2. Fix houses collection records stored under wrong collection names ($.2, $.4)
 * 3. Recalculate house totals to fix any tripling/doubling issues
 */

import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    writeBatch,
    query,
    where
} from 'firebase/firestore';

// Firebase config - make sure to set environment variables
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

// House name mappings from color to full name
const houseColorToName: Record<string, string> = {
    'blue': 'Blue Thunder',
    'gold': 'Gold Hearts',
    'green': 'Green Ivy',
    'orange': 'Orange Supernova',
    'pink': 'Pink Panthers',
    'purple': 'Purple Reign',
    'red': 'Red Phoenix',
    'silver': 'Silver Knights'
};

async function fixHouseRankingsCollection() {
    console.log('🔧 Fixing houseRankings collection...');

    try {
        const houseRankingsRef = collection(db, 'houseRankings');
        const snapshot = await getDocs(houseRankingsRef);

        if (snapshot.empty) {
            console.log('  ✅ No houseRankings collection found - nothing to fix');
            return;
        }

        const batch = writeBatch(db);
        let fixedCount = 0;

        for (const docSnapshot of snapshot.docs) {
            const docId = docSnapshot.id;
            const data = docSnapshot.data();

            // Check if this is a color name that needs to be converted to house name
            if (houseColorToName[docId.toLowerCase()]) {
                const correctHouseName = houseColorToName[docId.toLowerCase()];

                console.log(`  🔄 Moving ${docId} -> ${correctHouseName}`);

                // Create new document with correct house name
                const newDocRef = doc(db, 'houseRankings', correctHouseName);
                batch.set(newDocRef, data);

                // Delete old document with color name
                batch.delete(docSnapshot.ref);

                fixedCount++;
            }
        }

        if (fixedCount > 0) {
            await batch.commit();
            console.log(`  ✅ Fixed ${fixedCount} houseRankings documents`);
        } else {
            console.log('  ✅ No houseRankings documents needed fixing');
        }

    } catch (error) {
        console.error('  ❌ Error fixing houseRankings:', error);
    }
}

async function fixHousesCollectionNames() {
    console.log('🔧 Fixing houses collection naming issues...');

    try {
        // Look for documents in collections that start with $ or have weird names
        const weirdCollectionNames = ['$', '$.2', '$.4', '$2', '$4'];
        let fixedCount = 0;

        for (const collectionName of weirdCollectionNames) {
            try {
                const weirdCollectionRef = collection(db, collectionName);
                const snapshot = await getDocs(weirdCollectionRef);

                if (!snapshot.empty) {
                    console.log(`  🔍 Found ${snapshot.docs.length} documents in collection: ${collectionName}`);

                    const batch = writeBatch(db);

                    for (const docSnapshot of snapshot.docs) {
                        const data = docSnapshot.data();
                        console.log(`  📄 Document data:`, data);

                        // Try to determine correct house collection based on data
                        if (data.name && data.totalPoints !== undefined) {
                            // This looks like a house document
                            const correctDocRef = doc(db, 'houses', data.name);
                            batch.set(correctDocRef, data);
                            batch.delete(docSnapshot.ref);

                            console.log(`    ✅ Moving to houses/${data.name}`);
                            fixedCount++;
                        } else {
                            console.log(`    ⚠️  Unknown document structure - manual review needed`);
                        }
                    }

                    if (fixedCount > 0) {
                        await batch.commit();
                    }
                }
            } catch (error) {
                // Collection might not exist, which is fine
                console.log(`  ℹ️  Collection ${collectionName} not found (this is normal)`);
            }
        }

        console.log(`  ✅ Fixed ${fixedCount} documents with wrong collection names`);

    } catch (error) {
        console.error('  ❌ Error fixing collection names:', error);
    }
}

async function recalculateHouseTotals() {
    console.log('🔧 Recalculating house totals...');

    try {
        // Get all houses
        const housesRef = collection(db, 'houses');
        const housesSnapshot = await getDocs(housesRef);

        // Get all individuals
        const individualsRef = collection(db, 'individuals');
        const individualsSnapshot = await getDocs(individualsRef);

        // Get point categories to know which fields to sum
        const categoriesRef = collection(db, 'pointCategories');
        const categoriesSnapshot = await getDocs(categoriesRef);

        const categories = categoriesSnapshot.docs.map(doc => doc.data().key);

        const batch = writeBatch(db);
        let updatedCount = 0;

        for (const houseDoc of housesSnapshot.docs) {
            const houseData = houseDoc.data();
            const houseName = houseData.name;

            // Calculate totals from individual students
            const houseStudents = individualsSnapshot.docs.filter(doc =>
                doc.data().house === houseName
            );

            const categoryTotals: Record<string, number> = {};
            let totalPoints = 0;

            // Sum up points by category
            categories.forEach(categoryKey => {
                categoryTotals[categoryKey] = houseStudents.reduce((sum, studentDoc) => {
                    return sum + (studentDoc.data()[categoryKey] || 0);
                }, 0);
                totalPoints += categoryTotals[categoryKey];
            });

            // Update house document
            const updateData = {
                ...houseData,
                ...categoryTotals,
                totalPoints
            };

            batch.update(houseDoc.ref, updateData);
            updatedCount++;

            console.log(`  📊 ${houseName}: ${totalPoints} total points (${houseStudents.length} students)`);
        }

        await batch.commit();
        console.log(`  ✅ Recalculated totals for ${updatedCount} houses`);

    } catch (error) {
        console.error('  ❌ Error recalculating house totals:', error);
    }
}

async function runCleanup() {
    console.log('🚀 Starting database cleanup...\n');

    await fixHouseRankingsCollection();
    console.log('');

    await fixHousesCollectionNames();
    console.log('');

    await recalculateHouseTotals();
    console.log('');

    console.log('✅ Database cleanup completed!');
}

// Run the cleanup
runCleanup().catch(console.error);