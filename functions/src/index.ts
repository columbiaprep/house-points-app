import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {onSchedule} from "firebase-functions/v2/scheduler";

admin.initializeApp();

interface IndividualDocument {
  id: string;
  name: string;
  grade: number;
  house: string;
  totalPoints: number;
}

// Get data from Firestore function:
async function getDataFromFirestore() {
  const db = admin.firestore();
  const houses = await db.collection("houses").get();
  const individuals = await db.collection("individuals").get();
  const data = {
    houses: houses.docs.map((doc) => doc.data()),
    individuals: individuals.docs.map((doc) => doc.data()),
  };

  return data;
}

// Function to set leaderboards
async function setLeaderboardsLogic() {
  const db = admin.firestore();
  try {
    functions.logger.info("Setting leaderboards");
    const data = await getDataFromFirestore();
    // set leaderboards for each house's top 4 individuals
    // and top 4 individuals overall
    const topOverall = data.individuals
      .filter((individual) => individual.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      // tiebreaker logic
      .filter((individual, index, arr) => index < 4)
      .slice(0, 4);
    functions.logger.info("Wrote top overall leaderboard.... Writing to database now....");
    const topOverallRef = db.collection("leaderboards").doc("topOverall");
    topOverallRef.set({topOverall});
    functions.logger.info("Succesfully wrote top overall leaderboard to database... Writing house leaderboards now....");
    data.houses.forEach((house) => {
      const houseIndividuals: Array<IndividualDocument> = data.individuals.filter((individual) => individual.house === house.name) as IndividualDocument[];
      const houseLeaderboard = houseIndividuals.sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 4);
      const houseLeaderboardRef = db.collection("leaderboards").doc(house.name);

      houseLeaderboardRef.set({houseLeaderboard});
    });
    functions.logger.info("Successfully wrote house leaderboards to database... Completing operation now...");
    functions.logger.info("Operation completed successfully - Created by Sam Zack");
  } catch (error) {
    functions.logger.error(error);
  }
}

// Scheduled function to set leaderboards
export const setLeaderboards = onSchedule("every sunday 23:59", async () => {
  await setLeaderboardsLogic();
});

