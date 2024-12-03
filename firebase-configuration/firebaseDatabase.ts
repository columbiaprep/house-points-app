import { collection, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import app from './firebaseApp';

const db = getFirestore(app);

export interface IndividualDocument {
  name: string;
  grade: number;
  house: string;
  beingGoodPts: number;
  attendingEventsPts: number;
  id: string;
}

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

export async function fetchAllIndividuals() {
  const individualsQuery = await getDocs(collection(db, 'individuals'));
  return individualsQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function fetchAllHouses() {
  const housesQuery = await getDocs(collection(db, 'houses'));
  return housesQuery.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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