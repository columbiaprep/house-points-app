import { addDoc, collection, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import app from './firebaseApp';

const db = getFirestore(app);

export const getAllHousesLeaderboardData = async (): Promise<{ house: string; points: number[]; rank: number; }[]> => {
  const housesCollection = collection(db, 'houseRankings');
  const querySnapshot = await getDocs(housesCollection);
  const leaderboardData: { house: string; points: number[]; rank: number; }[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    leaderboardData.push({
      house: data.house,
      points: data.points,
      rank: data.rank,
    });
  });
  return leaderboardData;
}

export const getAllIndividualData = async (): Promise<{ name: string; points: number[]; rank: number; house: string; grade: number; }[]> => {
  const individualCollection = collection(db, 'individuals');
  const querySnapshot = await getDocs(individualCollection);
  const individualData: { name: string; points: number[]; rank: number; house: string; grade: number; }[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    individualData.push({
      name: data.name,
      points: data.points,
      rank: data.houseRank,
      house: data.house,
      grade: data.grade,
    });
  });
  return individualData;
}

export const writeDummyDataForIndividuals = async () => {
  const individualCollection = collection(db, 'individuals');
  // Houses are: Red, Blue, Green, Gold, Silver, Pink, Purple, Orange
  // Automatically generate 100 dummy data
  for (let i = 0; i < 100; i++) {
    const docRef = await addDoc(individualCollection, {
      name: `Student ${i}`,
      points: [
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
        Math.floor(Math.random() * 100),
      ],
      houseRank: Math.floor(Math.random() * 8),
      house: ['Red', 'Blue', 'Green', 'Gold', 'Silver', 'Pink', 'Purple', 'Orange'][Math.floor(Math.random() * 8)],
      grade: Math.floor(Math.random() * 12) + 1,
    });
    console.log("Document written with ID: ", docRef.id);
  }
}

