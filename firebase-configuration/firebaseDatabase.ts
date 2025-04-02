import { collection, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import app from './firebaseApp';

const db = getFirestore(app);

export interface IndividualDocument {
  name: string;
  grade: number;
  house: string;
  beingGoodPts: number;
  attendingEventsPts: number;
  sportsTeamPts: number;
  id: string;
}

// TODO: Do we still need HouseDocument? 
export interface HouseDocument {
  name: string;
  beingGoodPts: number;
  attendingEventsPts: number;
  id: string;
}

export interface FirestoreDataProps {
  individualsData: Array<IndividualDocument>;
  housesData: Array<HouseDocument>;
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  house: string;
}

export async function fetchAllIndividuals() {
  const individualsQuery = await getDocs(collection(db, 'individuals'));
  return individualsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function fetchAllHouses() {
  const housesQuery = await getDocs(collection(db, 'houses'));
  return housesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function fetchIndividualHouse(id: string): Promise<IndividualDocument> {
  const individualsQuery = await getDocs(collection(db, 'houses'));
  const individualsData = individualsQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IndividualDocument));
  const individual = individualsData.find((individual) => individual.id === id);
  if (!individual) {
    throw new Error(`House with id ${id} not found`);
  }
  return individual;
}

export async function fetchIndividual(id: string): Promise<IndividualDocument> {
  const individualsQuery = await getDocs(collection(db, 'individuals'));
  const individualsData = individualsQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IndividualDocument));
  const individual = individualsData.find((individual) => individual.id === id);
  if (!individual) {
    throw new Error(`Individual with id ${id} not found`);
  }
  return individual;
}

export async function writeToIndividualData(ptsCategory: string, id: string, points: number) {
  console.log(ptsCategory)
  let updateData = {};
  switch (ptsCategory) {
    case 'beingGoodPts':
      updateData = { beingGoodPts: points };
      break;
    case 'attendingEventsPts':
      updateData = { attendingEventsPts: points };
      break;
    default:
      throw new Error(`Unknown points category: ${ptsCategory}`);
  }
  await setDoc(doc(db, 'individuals', id), updateData, { merge: true });
}

export async function writeToHouseData(ptsCategory: string, id: string, points: number) {
  let updateData = {};
  switch (ptsCategory) {
    case 'beingGoodPts':
      updateData = { beingGoodPts: points };
      break;
    case 'attendingEventsPts':
      updateData = { attendingEventsPts: points };
      break;
    default:
      throw new Error(`Unknown points category: ${ptsCategory}`);
  }
  await setDoc(doc(db, 'houses', id), updateData, { merge: true });
}

export async function getSavedHouseRosterData(): Promise<Array<Student>> {
  const studentsQuery = await getDocs(collection(db, 'futureHouseRoster'));
  return studentsQuery.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      grade: data.grade,
      house: data.house
    } as Student;
  });
}

export async function resetDatabase(roster: Array<Student>) {
  const batch: Array<Promise<void>> = [];
  roster.forEach(student => {
    const studentDoc = doc(db, 'individuals', student.id);
    batch.push(setDoc(studentDoc, {
      name: student.name,
      grade: student.grade,
      house: student.house,
      beingGoodPts: 0,
      attendingEventsPts: 0,
      sportsTeamPts: 0
    }));
  });
  await Promise.all(batch);
}
