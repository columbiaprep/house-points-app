import { collection, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import app from './firebaseApp';

const db = getFirestore(app);

interface IndividualDocument {
  name: string;
  grade: number;
  house: string;
  points: Array<number>;
  id: string;
}

interface HouseDocument {
  name: string;
  points: Array<number>;
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

export async function fetchIndividual(id: string) {
  const individualsQuery = await getDocs(collection(db, 'individuals'));
  const individualsData = individualsQuery.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IndividualDocument));
  return individualsData.find((individual) => individual.id === id);
}

export async function writeToIndividualData(data: IndividualDocument) {
  await setDoc(doc(db, 'individuals', data.id), data);
}

export async function writeToHouseData(data: HouseDocument) {
  await setDoc(doc(db, 'houses', data.name), data);
}