import { recalculateHouseTotals } from './firebase-configuration/firebaseDb';

async function runRecalculation() {
  console.log('Starting house totals recalculation...');

  try {
    const result = await recalculateHouseTotals();

    if (result.success) {
      console.log('\n✅ Recalculation completed successfully!\n');
      console.log('Results:');
      result.results.forEach(house => {
        console.log(`\n${house.house}:`);
        console.log(`  Old Total: ${house.oldTotal}`);
        console.log(`  New Total: ${house.newTotal}`);
        console.log(`  Difference: ${house.difference}`);
        if (house.difference !== 0) {
          console.log(`  Category Breakdown:`, house.categoryBreakdown);
        }
      });
    } else {
      console.error('\n❌ Recalculation failed:', result.error);
    }
  } catch (error) {
    console.error('Error running recalculation:', error);
  }

  process.exit(0);
}

runRecalculation();
