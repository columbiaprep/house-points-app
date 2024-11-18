import { collection, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';

const db = getFirestore();

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

async function fetchData() {
  const individualsQuery = await getDocs(collection(db, 'individuals'));
  const housesQuery = await getDocs(collection(db, 'houses'));
  const individualsData = individualsQuery.docs.map((doc) => doc.data() as IndividualDocument);
  const housesData = housesQuery.docs.map((doc) => doc.data() as HouseDocument);
  return { individualsData, housesData };
}

export async function getServerSideProps(): Promise<{ props: { data: { individualsData: Array<IndividualDocument>, housesData: Array<HouseDocument> } } }> {
  const data = await fetchData();
  return { props: { data } };
}

export async function writeToIndividualData(data: IndividualDocument) {
  await setDoc(doc(db, 'individuals', data.id), data);
}

export async function writeToHouseData(data: HouseDocument) {
  await setDoc(doc(db, 'houses', data.name), data);
}
