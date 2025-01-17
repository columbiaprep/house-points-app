'use client';
import { collection, doc, getDoc, getDocs, setDoc } from '@firebase/firestore';

import { db } from './firebaseApp';

export interface IndividualDocument {
  name: string;
  grade: number;
  house: string;
  beingGoodPts: number;
  attendingEventsPts: number;
  sportsTeamPts: number;
  totalPoints: number;
  id: string;
}

export interface HouseDocument {
  name: string;
  beingGoodPts: number;
  attendingEventsPts: number;
  sportsTeamPts: number;
  totalPoints: number;
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

// House Data

export async function fetchAllIndividuals(): Promise<
  Array<IndividualDocument>
> {
  const individualsQuery = await getDocs(collection(db, 'individuals'));

  return individualsQuery.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name,
      grade: data.grade,
      house: data.house,
      beingGoodPts: data.beingGoodPts,
      attendingEventsPts: data.attendingEventsPts,
      sportsTeamPts: data.sportsTeamPts,
      totalPoints: data.beingGoodPts + data.attendingEventsPts + data.sportsTeamPts,
    } as IndividualDocument;
  });
}

export async function fetchAllHouses(): Promise<Array<HouseDocument>> {
  const housesQuery = await getDocs(collection(db, 'houses'));

  return housesQuery.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name,
      beingGoodPts: data.beingGoodPts,
      attendingEventsPts: data.attendingEventsPts,
      sportsTeamPts: data.sportsTeamPts,
      totalPoints: data.beingGoodPts + data.attendingEventsPts + data.sportsTeamPts,
    } as HouseDocument;
  });
}

export async function fetchIndividual(id: string): Promise<IndividualDocument> {
  const individualsQuery = await getDocs(collection(db, 'individuals'));
  const individualsData = individualsQuery.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      grade: data.grade,
      house: data.house,
      beingGoodPts: data.beingGoodPts,
      attendingEventsPts: data.attendingEventsPts,
      sportsTeamPts: data.sportsTeamPts,
      totalPoints: data.beingGoodPts + data.attendingEventsPts + data.sportsTeamPts,
    } as IndividualDocument;
  });
  const individual = individualsData.find((individual) => individual.id === id);

  if (!individual) {
    throw new Error(`Individual with id ${id} not found`);
  }

  return individual;
}

export async function writeToIndividualData(
  ptsCategory: string,
  id: string,
  points: number,
) {
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

export async function writeToHouseData(
  ptsCategory: string,
  id: string,
  points: number,
) {
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

  return studentsQuery.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name,
      grade: data.grade,
      house: data.house,
    } as Student;
  });
}

export async function resetDatabase(roster: Array<Student>) {
  const batch: Array<Promise<void>> = [];

  roster.forEach((student) => {
    const studentDoc = doc(db, 'individuals', student.id);

    batch.push(
      setDoc(studentDoc, {
        name: student.name,
        grade: student.grade,
        house: student.house,
        beingGoodPts: 0,
        attendingEventsPts: 0,
        sportsTeamPts: 0,
      }),
    );
  });
  await Promise.all(batch);
}

// Authentication Data
async function getAdmins() {
  const adminsQuery = await getDocs(collection(db, 'admins'));

  return adminsQuery.docs.map((doc) => doc.get('email'));
}

export async function addToDb(
  email: string,
  uid: string,
  displayName: string,
  photoURL: string,
) {
  const userDoc = doc(db, 'users', email);
  let accountType = 'teacher';

  if ((await getAdmins()).includes(email)) {
    accountType = 'admin';
  } else {
    for (let i = 0; i < 10; i++) {
      if (email.includes(i.toString())) {
        accountType = 'student';
        break;
      }
    }
  }

  await setDoc(userDoc, {
    uid,
    displayName,
    photoURL,
    email,
    accountType,
  });
}

export async function checkIfUserExists(email: string) {
  const userDoc = doc(db, 'users', email);
  const userDocSnapshot = await getDoc(userDoc);

  return userDocSnapshot.exists();
}

export async function getUserAccountType(
  email: string,
): Promise<string | null> {
  const userDoc = doc(db, 'users', email);
  const userDocSnapshot = await getDoc(userDoc);

  if (userDocSnapshot.exists()) {
    const data = userDocSnapshot.data();

    return data?.accountType;
  }

  return null;
}

export async function getUserPhoto(email: string): Promise<string> {
  const userDoc = doc(db, 'users', email);
  const userDocSnapshot = await getDoc(userDoc);

  if (userDocSnapshot.exists()) {
    const data = userDocSnapshot.data();

    return data?.photoURL;
  }

  return '';
}
