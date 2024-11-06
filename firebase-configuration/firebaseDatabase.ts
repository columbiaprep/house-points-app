import { collection, getDoc, getDocs, getFirestore } from 'firebase/firestore';
import app from './firebaseApp';
import { useState } from 'react';

const db = getFirestore(app);

export const [allHousesLeaderboard, setAllHousesLeaderboard] = useState<{ house: any; points: any; rank: any; }[]>([]);
export const [allIndividualLeaderboard, setAllIndividualLeaderboard] = useState<{ name: any; points: any; rank: any; }[]>([]);

export const getAllHousesLeaderboardData = async () => {
    const housesCollection = collection(db, 'Leaderboard/LeaderboardId/houseRankings');
    getDocs(housesCollection).then((querySnapshot) => {
                var leaderboardData: { house: any; points: any; rank: any; }[] = [];
                querySnapshot.forEach((doc) => {
                    // convert data into json
                    const data = doc.data();
                    leaderboardData.push({
                        house: data.house,
                        points: data.points,
                        rank: data.rank
                    });
                });
                setAllHousesLeaderboard(leaderboardData);
            });
}

export const getAllIndividualData = async () => {
    const individualCollection = collection(db, 'Leaderboard/LeaderboardId/memberRankings');
    getDocs(individualCollection).then((querySnapshot) => {
                var individualData: { name: any; points: any; rank: any; }[] = [];
                querySnapshot.forEach((doc) => {
                    // convert data into json
                    const data = doc.data();
                    individualData.push({
                        name: data.name,
                        points: data.points,
                        rank: data.rank
                    });
                });
                setAllIndividualLeaderboard(individualData);
            });
}