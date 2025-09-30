import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAllIndividuals, fetchAllHouses } from '../../firebase-configuration/firebaseDb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== Fetching all individuals ===');
    const individuals = await fetchAllIndividuals();

    const ellie = individuals.find(person => person.id === 'erazak26@cgps.org');
    const ellieData = ellie ? {
      name: ellie.name,
      house: ellie.house,
      totalPoints: ellie.totalPoints,
      fullData: ellie
    } : null;

    console.log('=== Fetching all houses ===');
    const houses = await fetchAllHouses();

    const pinkHouse = houses.find(house => house.id === 'pink' || house.name === 'pink');

    console.log('=== Calculating Pink Panthers totals from individuals ===');
    const pinkStudents = individuals.filter(person => person.house === 'pink');

    let calculatedTotal = 0;
    const categoryTotals = {};
    const studentDetails = [];

    pinkStudents.forEach(student => {
      calculatedTotal += student.totalPoints || 0;

      // Sum up category points
      Object.keys(student).forEach(key => {
        if (key !== 'id' && key !== 'name' && key !== 'house' && key !== 'totalPoints' && typeof student[key] === 'number') {
          categoryTotals[key] = (categoryTotals[key] || 0) + student[key];
        }
      });

      studentDetails.push({
        name: student.name,
        id: student.id,
        totalPoints: student.totalPoints || 0
      });
    });

    const result = {
      ellie: ellieData,
      pinkHouse: pinkHouse,
      pinkStudents: {
        count: pinkStudents.length,
        calculatedTotal,
        categoryTotals,
        students: studentDetails
      },
      discrepancy: null
    };

    if (pinkHouse) {
      const houseStudentPoints = pinkHouse.studentPoints || 0;
      const houseTotalPoints = pinkHouse.totalPoints || 0;
      const houseBonusPoints = pinkHouse.bonusPoints || 0;
      const expectedTotal = houseStudentPoints + houseBonusPoints;

      result.discrepancy = {
        calculatedFromStudents: calculatedTotal,
        houseStudentPoints,
        houseTotalPoints,
        houseBonusPoints,
        expectedTotal,
        studentPointsDifference: calculatedTotal - houseStudentPoints,
        totalPointsDifference: expectedTotal - houseTotalPoints
      };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data', details: error.message });
  }
}