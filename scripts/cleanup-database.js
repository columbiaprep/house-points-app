/**
 * Database cleanup script to fix existing issues:
 * 1. Fix houseRankings collection records with color names instead of house names
 * 2. Fix houses collection records stored under wrong collection names ($.2, $.4)
 * 3. Recalculate house totals to fix any tripling/doubling issues
 *
 * Run with: node scripts/cleanup-database.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK with service account
// Make sure you have the service account key file
try {
    const serviceAccount = require('../serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    console.error('❌ Could not load service account key. Make sure serviceAccountKey.json exists in the root directory.');
    process.exit(1);
}

const db = admin.firestore();

// House name mappings from color to full name
const houseColorToName = {
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
        const houseRankingsRef = db.collection('houseRankings');
        const snapshot = await houseRankingsRef.get();

        if (snapshot.empty) {
            console.log('  ✅ No houseRankings collection found - nothing to fix');
            return;
        }

        const batch = db.batch();
        let fixedCount = 0;

        for (const doc of snapshot.docs) {
            const docId = doc.id;
            const data = doc.data();

            // Check if this is a color name that needs to be converted to house name
            if (houseColorToName[docId.toLowerCase()]) {
                const correctHouseName = houseColorToName[docId.toLowerCase()];

                console.log(`  🔄 Moving ${docId} -> ${correctHouseName}`);

                // Create new document with correct house name
                const newDocRef = houseRankingsRef.doc(correctHouseName);
                batch.set(newDocRef, data);

                // Delete old document with color name
                batch.delete(doc.ref);

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
                const weirdCollectionRef = db.collection(collectionName);
                const snapshot = await weirdCollectionRef.get();

                if (!snapshot.empty) {
                    console.log(`  🔍 Found ${snapshot.docs.length} documents in collection: ${collectionName}`);

                    const batch = db.batch();

                    for (const doc of snapshot.docs) {
                        const data = doc.data();
                        console.log(`  📄 Document data:`, JSON.stringify(data, null, 2));

                        // Try to determine correct house collection based on data
                        if (data.name && data.totalPoints !== undefined) {
                            // This looks like a house document
                            const correctDocRef = db.collection('houses').doc(data.name);
                            batch.set(correctDocRef, data);
                            batch.delete(doc.ref);

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
        const housesRef = db.collection('houses');
        const housesSnapshot = await housesRef.get();

        // Get all individuals
        const individualsRef = db.collection('individuals');
        const individualsSnapshot = await individualsRef.get();

        // Get point categories to know which fields to sum
        const categoriesRef = db.collection('pointCategories');
        const categoriesSnapshot = await categoriesRef.get();

        const categories = categoriesSnapshot.docs.map(doc => doc.data().key);

        const batch = db.batch();
        let updatedCount = 0;

        for (const houseDoc of housesSnapshot.docs) {
            const houseData = houseDoc.data();
            const houseName = houseData.name;

            // Calculate totals from individual students
            const houseStudents = individualsSnapshot.docs.filter(doc =>
                doc.data().house === houseName
            );

            const categoryTotals = {};
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
    process.exit(0);
}

// Run the cleanup
runCleanup().catch(console.error);