/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
// Start writing functions
// https://firebase.google.com/docs/functions/typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as simpleGit from "simple-git";
import * as fs from "fs";
import * as path from "path";
import {onSchedule} from "firebase-functions/v2/scheduler";


const git = simpleGit.default();

admin.initializeApp();

// Get data from firestore function:

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

// Firebase function to get data from firestore and write it to a file:
// Need personal access token to push to github
export const generateJSONFile = onSchedule("every 3 days", async () => {
  try {
    const data = await getDataFromFirestore();
    const filePath = path.join(__dirname, "data.json");
    fs.writeFileSync(filePath, JSON.stringify(data));
    await git.add(filePath);
    await git.commit("Updated data.json");
    await git.push("origin", "main");
    await git.mergeFromTo("origin/main", "origin/production");
    await git.push("origin", "production");
    functions.logger.log("Successfully updated data.json");
  } catch (error) {
    functions.logger.error(error);
  }
});
