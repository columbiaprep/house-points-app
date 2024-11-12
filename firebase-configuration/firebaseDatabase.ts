import { collection, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import app from './firebaseApp';

const db = getFirestore(app);

export const getAllHousesLeaderboardData = async (): Promise<{ house: string; points: number[]; rank: number; }[]> => {
    const housesCollection = collection(db, 'Leaderboard/LeaderboardId/houseRankings');
    var leaderboardData: { house: string; points: Array<number>; rank: number; }[] = [];
    getDocs(housesCollection).then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    // convert data into json
                    const data = doc.data();
                    leaderboardData.push({
                        house: data.house,
                        points: data.points,
                        rank: data.rank
                    });
                });
            });
            return leaderboardData
}

export const getAllIndividualData = async (): Promise<{ name: string; points: number[]; rank: number; house: string; grade: number; }[]> => {
    const individualCollection = collection(db, 'Leaderboard/LeaderboardId/memberRankings');
    var individualData: { name: string; points: Array<number>; rank: number; house: string, grade: number }[] = [];
    getDocs(individualCollection).then((querySnapshot) => {
                var individualData: { name: string; points: Array<number>; rank: number; house: string, grade: number }[] = [];
                querySnapshot.forEach((doc) => {
                    // convert data into json
                    const data = doc.data();
                    individualData.push({
                        name: data.name,
                        points: data.points,
                        rank: data.houseRank,
                        house: data.house,
                        grade: data.grade
                    });
                });
            });
            return individualData;
}