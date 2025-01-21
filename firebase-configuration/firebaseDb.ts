import { collection, doc, getDoc, getDocs, setDoc } from "@firebase/firestore";

import { pointsCategories } from "./pointsCategoriesConfig";
import { db } from "./firebaseApp";

export interface IndividualDocument {
    id: string;
    name: string;
    grade: number;
    house: string;
    [key: string]: any; // Allows for dynamic point categories
}

export interface HouseDocument {
    id: string;
    name: string;
    [key: string]: any; // Allows for dynamic point categories
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

// Fetch all individuals
export async function fetchAllIndividuals(): Promise<
    Array<IndividualDocument>
> {
    const individualsQuery = await getDocs(collection(db, "individuals"));

    return individualsQuery.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            ...data,
        } as IndividualDocument;
    });
}

// Fetch all houses
export async function fetchAllHouses(): Promise<Array<HouseDocument>> {
    const housesQuery = await getDocs(collection(db, "houses"));

    return housesQuery.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            ...data,
        } as HouseDocument;
    });
}

// Fetch individual
export async function fetchIndividual(id: string): Promise<IndividualDocument> {
    const docRef = doc(db, "individuals", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
        throw new Error(`No individual found with id: ${id}`);
    }

    const data = docSnap.data();
    const individual: IndividualDocument = {
        id: docSnap.id,
        name: data.name,
        grade: data.grade,
        house: data.house,
    };

    Object.values(pointsCategories).forEach((category) => {
        individual[category.key] = data[category.key] || 0;
    });

    individual.totalPoints = Object.values(pointsCategories).reduce(
        (total, category) => total + (individual[category.key] || 0),
        0,
    );

    return individual;
}

// Write to individual data
export async function writeToIndividualData(
    ptsCategory: string,
    id: string,
    points: number,
) {
    if (
        !Object.values(pointsCategories).some(
            (category) => category.key === ptsCategory,
        )
    ) {
        throw new Error(`Unknown points category: ${ptsCategory}`);
    }

    const updateData = { [ptsCategory]: points };

    await setDoc(doc(db, "individuals", id), updateData, { merge: true });
}

// Write to house data
export async function writeToHouseData(
    ptsCategory: string,
    id: string,
    points: number,
) {
    if (
        !Object.values(pointsCategories).some(
            (category) => category.key === ptsCategory,
        )
    ) {
        throw new Error(`Unknown points category: ${ptsCategory}`);
    }

    const updateData = { [ptsCategory]: points };

    await setDoc(doc(db, "houses", id), updateData, { merge: true });
}

// Get saved house roster data
export async function getSavedHouseRosterData(): Promise<Array<Student>> {
    const studentsQuery = await getDocs(collection(db, "futureHouseRoster"));

    return studentsQuery.docs.map((doc) => {
        const data = doc.data();

        return data as Student;
    });
}

// Reset database
export async function resetDatabase(roster: Array<Student>) {
    const batch: Array<Promise<void>> = [];

    roster.forEach((student) => {
        const studentDoc = doc(db, "individuals", student.id);

        const resetData: { [key: string]: any } = {
            name: student.name,
            grade: student.grade,
            house: student.house,
        };

        Object.values(pointsCategories).forEach((category) => {
            resetData[category.key] = 0;
        });

        batch.push(setDoc(studentDoc, resetData));
    });

    await Promise.all(batch);
}

// Authentication Data
async function getAdmins() {
    const adminsQuery = await getDocs(collection(db, "admins"));

    return adminsQuery.docs.map((doc) => doc.get("email"));
}

export async function addToDb(
    email: string,
    uid: string,
    displayName: string,
    photoURL: string,
) {
    const userDoc = doc(db, "users", email);
    let accountType = "teacher";

    if ((await getAdmins()).includes(email)) {
        accountType = "admin";
    } else {
        for (let i = 0; i < 10; i++) {
            if (email.includes(i.toString())) {
                accountType = "student";
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
    const userDoc = doc(db, "users", email);
    const userDocSnapshot = await getDoc(userDoc);

    return userDocSnapshot.exists();
}

export async function getUserAccountType(
    email: string,
): Promise<string | null> {
    const userDoc = doc(db, "users", email);
    const userDocSnapshot = await getDoc(userDoc);

    if (userDocSnapshot.exists()) {
        const data = userDocSnapshot.data();

        return data?.accountType;
    }

    return null;
}

export async function getUserPhoto(email: string): Promise<string> {
    const userDoc = doc(db, "users", email);
    const userDocSnapshot = await getDoc(userDoc);

    if (userDocSnapshot.exists()) {
        const data = userDocSnapshot.data();

        return data?.photoURL;
    }

    return "";
}
