import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    setDoc,
    where,
} from "@firebase/firestore";

import { db } from "./firebaseApp";

export interface PointCategory {
    key: string;
    name: string;
    description: string;
}

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
    totalPoints: number;
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

export interface User {
    displayName: string;
    email: string;
}

export async function getPointsData(email: string) {
    const userDocRef = doc(db, "individuals", email);
    const userPoints = await getDoc(userDocRef);
    const myHouseLb = doc(db, "leaderboards", userPoints.data()?.house);
    const houseLb = await getDoc(myHouseLb);
    const topOverallLb = doc(db, "leaderboards", "topOverall");
    const topOverall = await getDoc(topOverallLb);

    return {
        userPoints: userPoints.data(),
        houseLb: houseLb.data(),
        topOverall: topOverall.data(),
    };
}

export let pointsCategories: any[] = [];

async function initializePointsCategories() {
    const pointsCategoriesSnapshot = await getDocs(
        collection(db, "pointCategories"),
    );

    pointsCategories = pointsCategoriesSnapshot.docs.map((doc) => doc.data());
}

initializePointsCategories();

export async function editPointCategory(
    id: string,
    updatedCategory: PointCategory,
) {
    const categoryDoc = doc(db, "pointCategories", id);

    await setDoc(categoryDoc, updatedCategory, { merge: true });
}

export async function addPointCategory(newCategory: PointCategory) {
    const categoryDoc = doc(db, "pointCategories", newCategory.key);

    await setDoc(categoryDoc, newCategory);
}

export async function deletePointCategory(id: string) {
    const categoryDoc = doc(db, "pointCategories", id);

    await deleteDoc(categoryDoc);
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
    const housesQuery = query(
        collection(db, "houses"),
        orderBy("totalPoints", "desc"),
    );
    const querySnapshot = await getDocs(housesQuery);

    return querySnapshot.docs.map((doc) => {
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
    // Fetch the existing individual document
    const individualDocRef = doc(db, "individuals", id);
    const individualDoc = await getDoc(individualDocRef);

    let updateData = { [ptsCategory]: points };

    if (individualDoc.exists()) {
        const individualData = individualDoc.data();

        // Check if the point category exists in the document
        if (individualData && !individualData.hasOwnProperty(ptsCategory)) {
            // Add the point category if it doesn't exist
            updateData = { ...individualData, [ptsCategory]: points };
        } else {
            // Update the existing point category
            updateData = {
                ...individualData,
                [ptsCategory]: (individualData[ptsCategory] || 0) + points,
            };
        }
        if (ptsCategory !== "totalPoints") {
            updateData.totalPoints =
                (individualDoc.data().totalPoints || 0) + points;
        }
    }

    const houseId = await fetchIndividual(id).then(
        (individual) => individual.house,
    );

    await setDoc(individualDocRef, updateData, { merge: true });
    await writeToHouseData(ptsCategory, houseId, points);
}

// Write to house data
export async function writeToHouseData(
    ptsCategory: string,
    id: string,
    points: number,
) {
    // Fetch the existing house document
    const houseDocRef = doc(db, "houses", id);
    const houseDoc = await getDoc(houseDocRef);

    let updateData = { [ptsCategory]: points };

    if (houseDoc.exists()) {
        const houseData = houseDoc.data();

        // Check if the point category exists in the document
        if (houseData && !houseData.hasOwnProperty(ptsCategory)) {
            // Add the point category if it doesn't exist
            updateData = { ...houseData, [ptsCategory]: points };
        } else {
            // Update the existing point category
            updateData = {
                ...houseData,
                [ptsCategory]: (houseData[ptsCategory] || 0) + points,
            };
        }
        if (ptsCategory !== "totalPoints") {
            updateData.totalPoints = (houseData.totalPoints || 0) + points;
        }
    }

    await setDoc(houseDocRef, updateData, { merge: true });
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

    // compile all houses data to reset
    const housesQuery = await getDocs(collection(db, "houses"));
    // if house of student is not in the houses collection, add it

    roster.forEach((student) => {
        const studentDoc = doc(db, "individuals", student.id);
        const houseDoc = doc(db, "houses", student.house);
        const studentHouse = student.house;
        const houseResetData: { [key: string]: any } = {
            name: studentHouse,
        };

        Object.values(pointsCategories).forEach((category) => {
            houseResetData[category.key] = 0;
        });
        batch.push(setDoc(houseDoc, houseResetData));

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

// Admins data
export async function getCurrentAdmins(): Promise<Array<User>> {
    const adminsQuery = query(
        collection(db, "users"),
        where("accountType", "==", "admin"),
    );
    const querySnapshot = await getDocs(adminsQuery);

    return querySnapshot.docs.map((doc) => doc.data() as User);
}

export async function addAdmin(email: string) {
    const userDoc = doc(db, "users", email);
    const userDocSnapshot = await getDoc(userDoc);

    if (userDocSnapshot.exists()) {
        const data = userDocSnapshot.data();

        await setDoc(doc(db, "users", email), {
            ...data,
            accountType: "admin",
        });
    } else {
        return Promise.reject("User does not exist");
    }
}

export async function removeAdmin(email: string) {
    const userDoc = doc(db, "users", email);
    const userDocSnapshot = await getDoc(userDoc);

    if (userDocSnapshot.exists()) {
    }
    // if email contains number, it is a student
    for (let i = 0; i < 10; i++) {
        if (email.includes(i.toString())) {
            await setDoc(doc(db, "users", email), {
                ...userDocSnapshot.data(),
                accountType: "student",
            });

            return;
        }
    }
    // if email is not a student, it is a teacher
    await setDoc(userDoc, {
        ...userDocSnapshot.data(),
        accountType: "teacher",
    });
}

// Authentication Data
async function getAdmins() {
    const adminsQuery = await getDocs(collection(db, "admins"));

    if (adminsQuery.empty) {
        return [];
    }

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
