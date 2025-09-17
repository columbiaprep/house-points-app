/**
 * Client-side script to fix database records using existing Firebase config
 * Run this in the browser console after opening your app
 */

// This script should be run in the browser console of your running app
// where Firebase is already initialized

async function fixIncorrectRecords() {
    console.log('🔧 Starting database fixes...');

    if (typeof db === 'undefined') {
        console.error('❌ Firebase db not found. Make sure Firebase is initialized.');
        return;
    }

    // Import necessary functions
    const { collection, getDocs, doc, setDoc, deleteDoc, writeBatch } = window.firebase.firestore;

    try {
        // Fix 1: Move records from $.2, $.4 etc to houses collection
        const weirdCollectionNames = ['$.2', '$.4', '$', '$2', '$4'];
        let housesFixed = 0;

        for (const collectionName of weirdCollectionNames) {
            try {
                console.log(`🔍 Checking collection: ${collectionName}`);
                const collectionRef = collection(db, collectionName);
                const snapshot = await getDocs(collectionRef);

                if (!snapshot.empty) {
                    console.log(`  📁 Found ${snapshot.docs.length} documents in ${collectionName}`);

                    for (const docSnapshot of snapshot.docs) {
                        const data = docSnapshot.data();
                        console.log(`  📄 Document:`, data);

                        if (data.name && typeof data.totalPoints !== 'undefined') {
                            // This looks like a house document
                            const houseName = data.name;
                            console.log(`    🏠 Moving house data: ${houseName}`);

                            // Create in correct houses collection
                            const houseRef = doc(db, 'houses', houseName);
                            await setDoc(houseRef, data, { merge: true });

                            // Delete from wrong collection
                            await deleteDoc(docSnapshot.ref);

                            console.log(`    ✅ Moved ${houseName} to houses collection`);
                            housesFixed++;
                        }
                    }
                }
            } catch (error) {
                console.log(`  ℹ️  Collection ${collectionName} not accessible (normal)`);
            }
        }

        // Fix 2: Move pink houseRankings to Pink Panthers
        console.log('🔧 Fixing houseRankings pink -> Pink Panthers...');

        const pinkRankingRef = doc(db, 'houseRankings', 'pink');
        const pinkDoc = await getDoc(pinkRankingRef);

        if (pinkDoc.exists()) {
            console.log('📁 Found pink houseRankings document');
            const pinkData = pinkDoc.data();

            // Get students subcollection
            const studentsRef = collection(db, 'houseRankings', 'pink', 'students');
            const studentsSnapshot = await getDocs(studentsRef);

            console.log(`  👥 Found ${studentsSnapshot.docs.length} students in pink/students`);

            // Create Pink Panthers document
            const pinkPanthersRef = doc(db, 'houseRankings', 'Pink Panthers');
            await setDoc(pinkPanthersRef, pinkData);

            // Copy all students in batches
            const batch = writeBatch(db);
            let batchCount = 0;
            let totalStudents = 0;

            for (const studentDoc of studentsSnapshot.docs) {
                const studentData = studentDoc.data();
                const newStudentRef = doc(db, 'houseRankings', 'Pink Panthers', 'students', studentDoc.id);
                batch.set(newStudentRef, studentData);
                batchCount++;
                totalStudents++;

                if (batchCount >= 500) { // Firestore batch limit
                    await batch.commit();
                    console.log(`    📝 Copied ${totalStudents} students so far...`);
                    batchCount = 0;
                }
            }

            if (batchCount > 0) {
                await batch.commit();
            }

            console.log(`  ✅ Copied ${totalStudents} students to Pink Panthers`);

            // Delete old documents
            const deleteBatch = writeBatch(db);
            for (const studentDoc of studentsSnapshot.docs) {
                deleteBatch.delete(studentDoc.ref);
            }
            await deleteBatch.commit();
            await deleteDoc(pinkRankingRef);

            console.log('  🗑️  Deleted old pink documents');
            console.log('✅ Pink Panthers houseRankings fixed!');

        } else {
            console.log('ℹ️  No pink houseRankings found');
        }

        console.log(`🎉 Database fixes complete! Fixed ${housesFixed} house records.`);

    } catch (error) {
        console.error('❌ Error during fixes:', error);
    }
}

// Export for use
window.fixIncorrectRecords = fixIncorrectRecords;

console.log('📋 Database fix script loaded!');
console.log('Run fixIncorrectRecords() to start the fixes');

// Auto-run if desired
// fixIncorrectRecords();