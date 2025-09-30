import { fetchAllIndividuals, fetchAllHouses } from './firebase-configuration/firebaseDb';

async function checkData() {
  try {
    console.log('=== Fetching all individuals ===');
    const individuals = await fetchAllIndividuals();

    const ellie = individuals.find(person => person.id === 'erazak26@cgps.org');
    if (ellie) {
      console.log('Ellie Razak found:');
      console.log('  Name:', ellie.name);
      console.log('  House:', ellie.house);
      console.log('  Total Points:', ellie.totalPoints);
      console.log('  All data:', JSON.stringify(ellie, null, 2));
    } else {
      console.log('Ellie Razak not found in individuals');
    }

    console.log('\n=== Fetching all houses ===');
    const houses = await fetchAllHouses();

    const pinkHouse = houses.find(house => house.id === 'pink' || house.name === 'pink');
    if (pinkHouse) {
      console.log('Pink Panthers house data:');
      console.log(JSON.stringify(pinkHouse, null, 2));
    } else {
      console.log('Pink Panthers house not found');
    }

    console.log('\n=== Calculating Pink Panthers totals from individuals ===');
    const pinkStudents = individuals.filter(person => person.house === 'pink');
    console.log(`Found ${pinkStudents.length} Pink Panthers students`);

    let calculatedTotal = 0;
    const categoryTotals = {};

    pinkStudents.forEach(student => {
      calculatedTotal += student.totalPoints || 0;

      // Sum up category points
      Object.keys(student).forEach(key => {
        if (key !== 'id' && key !== 'name' && key !== 'house' && key !== 'totalPoints' && typeof student[key] === 'number') {
          categoryTotals[key] = (categoryTotals[key] || 0) + student[key];
        }
      });

      console.log(`  ${student.name}: ${student.totalPoints || 0} points`);
    });

    console.log(`\nCalculated total from students: ${calculatedTotal}`);
    console.log('Category totals from students:', categoryTotals);

    if (pinkHouse) {
      console.log(`House record studentPoints: ${pinkHouse.studentPoints || 0}`);
      console.log(`House record totalPoints: ${pinkHouse.totalPoints || 0}`);
      console.log(`House record bonusPoints: ${pinkHouse.bonusPoints || 0}`);

      const expectedTotal = (pinkHouse.studentPoints || 0) + (pinkHouse.bonusPoints || 0);
      console.log(`Expected total (studentPoints + bonusPoints): ${expectedTotal}`);

      if (calculatedTotal !== (pinkHouse.studentPoints || 0)) {
        console.log(`\n🚨 DISCREPANCY FOUND!`);
        console.log(`  Sum of individual students: ${calculatedTotal}`);
        console.log(`  House studentPoints field: ${pinkHouse.studentPoints || 0}`);
        console.log(`  Difference: ${calculatedTotal - (pinkHouse.studentPoints || 0)}`);
      } else {
        console.log(`\n✅ Student points match between individuals and house record`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();