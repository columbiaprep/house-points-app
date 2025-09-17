/**
 * Fix specific database records:
 * 1. Move records from collections like "$.2" to the correct houses collection
 * 2. Move "pink" document in houseRankings to "Pink Panthers"
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    try {
        // Try to use default credentials or service account key
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        } else {
            // Fallback to service account key file
            const serviceAccount = require('../serviceAccountKey.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
    } catch (error) {
        console.error('❌ Could not initialize Firebase Admin SDK:', error.message);
        console.log('Make sure you have either:');
        console.log('1. Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
        console.log('2. Or have serviceAccountKey.json in the root directory');
        process.exit(1);
    }
}

const db = admin.firestore();

// House name mappings - mapping colors to full names
const colorToHouseName = {
    'pink': 'Pink Panthers',
    'blue': 'Blue Thunder',
    'gold': 'Gold Hearts',
    'green': 'Green Ivy',
    'orange': 'Orange Supernova',
    'purple': 'Purple Reign',
    'red': 'Red Phoenix',
    'silver': 'Silver Knights'
};

async function fixIncorrectHouseCollections() {
    console.log('🔧 Fixing incorrect house collection records...\n');

    // Look for documents in collections that start with $ or have weird names
    const weirdCollectionNames = ['$.2', '$.4', '$', '$2', '$4', '$.1', '$.3', '$.5'];
    let totalFixed = 0;

    for (const collectionName of weirdCollectionNames) {
        try {
            console.log(`🔍 Checking collection: ${collectionName}`);
            const collectionRef = db.collection(collectionName);
            const snapshot = await collectionRef.get();

            if (!snapshot.empty) {
                console.log(`  📁 Found ${snapshot.docs.length} documents in collection: ${collectionName}`);

                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    console.log(`  📄 Document ID: ${doc.id}`);
                    console.log(`  📊 Data:`, JSON.stringify(data, null, 2));

                    // Check if this looks like a house document
                    if (data.name && typeof data.totalPoints !== 'undefined') {
                        const houseName = data.name;
                        console.log(`    🏠 Looks like house data for: ${houseName}`);

                        // Move to correct houses collection
                        const correctHouseRef = db.collection('houses').doc(houseName);

                        // Check if the house already exists
                        const existingHouse = await correctHouseRef.get();
                        if (existingHouse.exists()) {
                            console.log(`    ⚠️  House ${houseName} already exists in houses collection`);
                            console.log(`    🔄 Merging data...`);

                            // Merge the data (existing data takes precedence for conflicts)
                            const existingData = existingHouse.data();
                            const mergedData = { ...data, ...existingData };
                            await correctHouseRef.set(mergedData);
                        } else {
                            console.log(`    ➕ Creating new house document: ${houseName}`);
                            await correctHouseRef.set(data);
                        }

                        // Delete the old document
                        await doc.ref.delete();
                        console.log(`    ✅ Moved ${houseName} from ${collectionName} to houses collection`);
                        totalFixed++;
                    } else {
                        console.log(`    ❓ Unknown document structure - skipping`);
                        console.log(`       Data: ${JSON.stringify(data)}`);
                    }
                }
            } else {
                console.log(`  ✅ Collection ${collectionName} is empty or doesn't exist`);
            }

        } catch (error) {
            console.log(`  ℹ️  Collection ${collectionName} not found or inaccessible (this is normal)`);
        }

        console.log('');
    }

    console.log(`🎉 Fixed ${totalFixed} incorrect house collection records\n`);
}

async function fixHouseRankingsPink() {
    console.log('🔧 Fixing houseRankings pink -> Pink Panthers...\n');

    try {
        // Check if there's a "pink" document in houseRankings
        const pinkRef = db.collection('houseRankings').doc('pink');
        const pinkDoc = await pinkRef.get();

        if (pinkDoc.exists()) {
            console.log('📁 Found "pink" document in houseRankings');
            const pinkData = pinkDoc.data();

            // Check if there's a students subcollection
            const studentsRef = pinkRef.collection('students');
            const studentsSnapshot = await studentsRef.get();

            if (!studentsSnapshot.empty) {
                console.log(`  👥 Found ${studentsSnapshot.docs.length} students in pink/students subcollection`);

                // Create the correct Pink Panthers collection
                const pinkPanthersRef = db.collection('houseRankings').doc('Pink Panthers');

                // Copy the main document data
                await pinkPanthersRef.set(pinkData);
                console.log('  ✅ Created Pink Panthers document');

                // Copy all students
                const batch = db.batch();
                let studentCount = 0;

                for (const studentDoc of studentsSnapshot.docs) {
                    const studentData = studentDoc.data();
                    const newStudentRef = pinkPanthersRef.collection('students').doc(studentDoc.id);
                    batch.set(newStudentRef, studentData);
                    studentCount++;

                    if (studentCount % 50 === 0) {
                        await batch.commit();
                        console.log(`    📝 Copied ${studentCount} students...`);
                    }
                }

                // Commit any remaining students
                if (studentCount % 50 !== 0) {
                    await batch.commit();
                }

                console.log(`  ✅ Copied ${studentCount} students to Pink Panthers/students`);

                // Delete the old pink collection and its subcollection
                const deleteStudentsBatch = db.batch();
                for (const studentDoc of studentsSnapshot.docs) {
                    deleteStudentsBatch.delete(studentDoc.ref);
                }
                await deleteStudentsBatch.commit();
                console.log('  🗑️  Deleted old pink/students subcollection');

                // Delete the main pink document
                await pinkRef.delete();
                console.log('  🗑️  Deleted old pink document');

                console.log('🎉 Successfully moved pink houseRankings to Pink Panthers!');

            } else {
                console.log('  ℹ️  No students found in pink/students subcollection');

                // Just move the main document
                const pinkPanthersRef = db.collection('houseRankings').doc('Pink Panthers');
                await pinkPanthersRef.set(pinkData);
                await pinkRef.delete();
                console.log('  ✅ Moved empty pink document to Pink Panthers');
            }

        } else {
            console.log('ℹ️  No "pink" document found in houseRankings - nothing to fix');
        }

    } catch (error) {
        console.error('❌ Error fixing houseRankings pink:', error);
    }

    console.log('');
}

async function listCollections() {
    console.log('📋 Listing all collections to verify...\n');

    try {
        const collections = await db.listCollections();
        console.log('Available collections:');
        for (const collection of collections) {
            console.log(`  - ${collection.id}`);
        }
        console.log('');

        // Check houses collection
        console.log('🏠 Houses collection:');
        const housesSnapshot = await db.collection('houses').get();
        housesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`  - ${doc.id}: ${data.name || 'No name'} (${data.totalPoints || 0} points)`);
        });
        console.log('');

        // Check houseRankings collection
        console.log('🏆 HouseRankings collection:');
        const rankingsSnapshot = await db.collection('houseRankings').get();
        if (rankingsSnapshot.empty) {
            console.log('  - No houseRankings found');
        } else {
            for (const doc of rankingsSnapshot.docs) {
                const studentsSnapshot = await doc.ref.collection('students').get();
                console.log(`  - ${doc.id}: ${studentsSnapshot.docs.length} students`);
            }
        }

    } catch (error) {
        console.error('❌ Error listing collections:', error);
    }
}

async function runFixes() {
    console.log('🚀 Starting specific database fixes...\n');

    await listCollections();
    await fixIncorrectHouseCollections();
    await fixHouseRankingsPink();

    console.log('📋 Final state after fixes:');
    await listCollections();

    console.log('✅ All fixes completed!');
    process.exit(0);
}

// Run the fixes
runFixes().catch(console.error);