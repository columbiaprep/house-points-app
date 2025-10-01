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

    const silverHouse = houses.find(house => house.id === 'Silver Knights' || house.name === 'Silver Knights');
    if (silverHouse) {
      console.log('Silver Knights house data:');
      console.log(JSON.stringify(silverHouse, null, 2));
    } else {
      console.log('Silver Knights house not found');
    }

    console.log('\n=== Calculating Silver Knights totals from individuals ===');
    const silverStudents = individuals.filter(person => person.house === 'Silver Knights');
    console.log(`Found ${silverStudents.length} Silver Knights students`);

    let calculatedTotal = 0;
    const categoryTotals = {};

    silverStudents.forEach(student => {
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

    if (silverHouse) {
      console.log(`House record studentPoints: ${silverHouse.studentPoints || 0}`);
      console.log(`House record totalPoints: ${silverHouse.totalPoints || 0}`);
      console.log(`House record bonusPoints: ${silverHouse.bonusPoints || 0}`);

      const expectedTotal = (silverHouse.studentPoints || 0) + (silverHouse.bonusPoints || 0);
      console.log(`Expected total (studentPoints + bonusPoints): ${expectedTotal}`);

      if (calculatedTotal !== (silverHouse.studentPoints || 0)) {
        console.log(`\n🚨 DISCREPANCY FOUND!`);
        console.log(`  Sum of individual students: ${calculatedTotal}`);
        console.log(`  House studentPoints field: ${silverHouse.studentPoints || 0}`);
        console.log(`  Difference: ${calculatedTotal - (silverHouse.studentPoints || 0)}`);
      } else {
        console.log(`\n✅ Student points match between individuals and house record`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();