'use client';
import { collection, doc, getDoc, getDocs, setDoc } from '@firebase/firestore';

import { db } from './firebaseAppClient';

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
