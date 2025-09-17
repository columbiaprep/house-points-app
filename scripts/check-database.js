const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, limit } = require('firebase/firestore');

// Firebase config - you'll need to add your config here
const firebaseConfig = {
  // Add your Firebase config here
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDatabaseStructure() {
  console.log('🔍 Checking Firestore database structure...\n');

  try {
    // Check houses collection
    console.log('📁 Houses Collection:');
    const housesSnapshot = await getDocs(collection(db, 'houses'));
    if (housesSnapshot.empty) {
      console.log('  ❌ Houses collection is empty');
    } else {
      housesSnapshot.docs.forEach(doc => {
        console.log(`  📄 Doc ID: ${doc.id}`);
        const data = doc.data();
        console.log(`      Name: ${data.name}`);
        console.log(`      ColorName: ${data.colorName}`);
        console.log(`      TotalPoints: ${data.totalPoints}`);
      });
    }

    console.log('\n📁 HouseRankings Collection:');
    const houseRankingsSnapshot = await getDocs(collection(db, 'houseRankings'));
    if (houseRankingsSnapshot.empty) {
      console.log('  ❌ HouseRankings collection is empty');
    } else {
      houseRankingsSnapshot.docs.forEach(doc => {
        console.log(`  📄 Doc ID: ${doc.id}`);
      });
    }

    // Check for weird collection names like $.2, $.4
    console.log('\n🔍 Looking for incorrectly named collections...');
    const rootCollections = await getDocs(query(collection(db, '$'), limit(5)));
    if (!rootCollections.empty) {
      console.log('  ⚠️  Found collections starting with $:');
      rootCollections.docs.forEach(doc => {
        console.log(`    📄 ${doc.id}: ${JSON.stringify(doc.data())}`);
      });
    }

    // Check individuals collection for sample data
    console.log('\n📁 Sample Individual Records:');
    const individualsSnapshot = await getDocs(query(collection(db, 'individuals'), limit(3)));
    individualsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  📄 ${doc.id} - ${data.name} (${data.house})`);
      console.log(`      TotalPoints: ${data.totalPoints}`);
    });

  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkDatabaseStructure();