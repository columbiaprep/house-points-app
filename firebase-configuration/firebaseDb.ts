import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    setDoc,
    deleteDoc,
    where,
    or,
    and,
} from "@firebase/firestore";

import { db } from "./firebaseApp";

export interface PointCategory {
    key: string;
    name: string;
    description: string;
}

export interface PointCategories extends PointCategory {
    id: string;
}

export interface IndividualDocument {
    id: string;
    name: string;
    grade: number;
    house: string;
    [key: string]: any; // Allows for dynamic point categories
    houseRank: number;
}

export interface HouseDocument {
    id: string;
    name: string;
    studentPoints: number; // NEW: sum of all student earned points
    bonusPoints: number;   // NEW: sum of all house bonus points
    totalPoints: number;   // studentPoints + bonusPoints
    [key: string]: any; // Allows for dynamic point categories
    colorName: string;
    accentColor: string;
    place: number;
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

export interface BonusPoint {
    id: string;
    category: string;
    points: number;
    timestamp: Date;
    reason: string;
    addedBy: string;
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

    return querySnapshot.docs.map((doc, index) => {
        const data = doc.data();

        return {
            id: doc.id,
            place: index + 1,
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
        houseRank: data.houseRank,
        totalPoints: data.totalPoints || 0, // Use stored totalPoints instead of recalculating
    };

    Object.values(pointsCategories).forEach((category) => {
        individual[category.key] = data[category.key] || 0;
    });

    return individual;
}

// Given a student, fetches the students above and/or below them in rank
// Returns an array with 1 or 2 elements, the individual before and/or the one after
export async function fetchNeighbors(
    student: IndividualDocument,
): Promise<IndividualDocument[]> {
    const collectionRef = collection(db, "individuals");

    const q = query(
        collectionRef,
        and(
            where("houseName", "==", student.house),
            or(
                where("houseRank", ">=", student.houseRank + 1),
                where("houseRank", "<=", student.houseRank - 1),
            ),
        ),
    );
    const docSnap = await getDocs(q);

    if (!docSnap.empty) {
        throw new Error(`No neighbors found for ${student.name}`);
    }

    return docSnap.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            ...data,
        } as IndividualDocument;
    });
}

// Fetch top 5 individuals in a given house
export async function fetchTopFiveInHouse(
    houseName: string,
): Promise<IndividualDocument[]> {
    const collectionRef = collection(db, "individuals");
    const q = query(
        collectionRef,
        where("houseName", "==", houseName),
        where("houseRank", ">=", 1),
        where("houseRank", "<=", 5),
    );
    const docSnap = await getDocs(q);

    if (!docSnap.empty) {
        throw new Error(`No top 5 students matching`);
    }

    return docSnap.docs.map((doc) => {
        const data = doc.data();

        return {
            id: doc.id,
            ...data,
        } as IndividualDocument;
    });
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
    let houseId = "";

    if (individualDoc.exists()) {
        const individualData = individualDoc.data();
        houseId = individualData.house; // Get house directly from existing data

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
        if (!houseData.hasOwnProperty(ptsCategory)) {
            // Add the point category if it doesn't exist
            updateData = { ...houseData, [ptsCategory]: points };
        } else {
            // Update the existing point category
            updateData = {
                ...houseData,
                [ptsCategory]: (houseData[ptsCategory] || 0) + points,
            };
        }

        // Update studentPoints and totalPoints for student-earned points
        if (ptsCategory !== "totalPoints" && ptsCategory !== "studentPoints" && ptsCategory !== "bonusPoints") {
            updateData.studentPoints = (houseData.studentPoints || 0) + points;
            updateData.totalPoints = (houseData.studentPoints || 0) + points + (houseData.bonusPoints || 0);
        }
    } else {
        // Initialize new house document with default values
        const houseColorInfo = getHouseColorInfo(id);
        updateData = {
            id,
            name: id,
            colorName: houseColorInfo.colorName,
            accentColor: houseColorInfo.accentColor,
            studentPoints: ptsCategory !== "totalPoints" && ptsCategory !== "studentPoints" && ptsCategory !== "bonusPoints" ? points : 0,
            bonusPoints: 0,
            totalPoints: ptsCategory !== "totalPoints" && ptsCategory !== "studentPoints" && ptsCategory !== "bonusPoints" ? points : 0,
            place: 0,
            [ptsCategory]: points,
        };
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

// Helper function to get house color information
function getHouseColorInfo(houseName: string): {
    colorName: string;
    accentColor: string;
} {
    const houseColorMap: Record<
        string,
        { colorName: string; accentColor: string }
    > = {
        "Blue House": { colorName: "blue", accentColor: "blue" },
        "Blue Thunder": { colorName: "blue", accentColor: "blue" },
        "Gold House": { colorName: "yellow", accentColor: "yellow" },
        "Gold Hearts": { colorName: "yellow", accentColor: "yellow" },
        "Green House": { colorName: "green", accentColor: "green" },
        "Green Ivy": { colorName: "green", accentColor: "green" },
        "Orange House": { colorName: "orange", accentColor: "orange" },
        "Orange Supernova": { colorName: "orange", accentColor: "orange" },
        "Pink House": { colorName: "pink", accentColor: "pink" },
        "Pink Panthers": { colorName: "pink", accentColor: "pink" },
        "Purple House": { colorName: "purple", accentColor: "purple" },
        "Purple Reign": { colorName: "purple", accentColor: "purple" },
        "Red House": { colorName: "red", accentColor: "red" },
        "Red Phoenix": { colorName: "red", accentColor: "red" },
        "Silver House": { colorName: "slate", accentColor: "slate" },
        "Silver Knights": { colorName: "slate", accentColor: "slate" },
    };

    return (
        houseColorMap[houseName] || { colorName: "blue", accentColor: "blue" }
    );
}

// Reset database
export async function resetDatabase(roster: Array<Student>) {
    const batch: Array<Promise<void>> = [];

    // compile all houses data to reset
    // if house of student is not in the houses collection, add it

    // First, clear all bonus points for all houses
    const allHouses = await getDocs(collection(db, "houses"));

    for (const houseDoc of allHouses.docs) {
        const bonusPointsQuery = await getDocs(
            collection(db, "houses", houseDoc.id, "bonusPoints"),
        );

        bonusPointsQuery.docs.forEach((bonusDoc) => {
            batch.push(deleteDoc(bonusDoc.ref));
        });
    }

    // Clear all existing individual documents to ensure complete reset
    const allIndividuals = await getDocs(collection(db, "individuals"));

    allIndividuals.docs.forEach((individualDoc) => {
        batch.push(deleteDoc(individualDoc.ref));
    });

    // Clear houseSummaries to ensure fresh aggregation
    const allHouseSummaries = await getDocs(collection(db, "houseSummaries"));

    allHouseSummaries.docs.forEach((summaryDoc) => {
        batch.push(deleteDoc(summaryDoc.ref));
    });

    roster.forEach((student) => {
        const studentDoc = doc(db, "individuals", student.id);
        const houseDoc = doc(db, "houses", student.house);
        const studentHouse = student.house;
        const houseColorInfo = getHouseColorInfo(studentHouse);

        const houseResetData: { [key: string]: any } = {
            name: studentHouse,
            colorName: houseColorInfo.colorName,
            accentColor: houseColorInfo.accentColor,
            totalPoints: 0,
            place: 0,
        };

        Object.values(pointsCategories).forEach((category) => {
            houseResetData[category.key] = 0;
        });
        batch.push(setDoc(houseDoc, houseResetData));

        const resetData: { [key: string]: any } = {
            name: student.name,
            grade: student.grade,
            house: student.house,
            houseRank: 0,
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

export async function getPointCategories() {
    const pointCategoriesQuery = await getDocs(
        collection(db, "pointCategories"),
    );

    return pointCategoriesQuery.docs.map((doc) => {
        const data = doc.data();
        const pointCategory: PointCategories = {
            id: doc.id,
            description: data.description,
            key: data.key,
            name: data.name,
        };

        return pointCategory;
    });
}

export async function updatePointCategory(
    id: string,
    updatedCategory: PointCategories,
) {
    const pointCategoryDoc = doc(db, "pointCategories", id);

    await setDoc(pointCategoryDoc, updatedCategory);
}
export async function addPointCategory(newCategory: PointCategory) {
    const pointCategoryDoc = doc(collection(db, "pointCategories"));

    await setDoc(pointCategoryDoc, newCategory);
}

export async function deletePointCategory(id: string) {
    const pointCategoryDoc = doc(db, "pointCategories", id);

    await setDoc(pointCategoryDoc, { deleted: true }, { merge: true });
}

// Bonus Points Functions
export async function addBonusPointToHouse(
    houseId: string,
    category: string,
    points: number,
    reason: string,
    addedBy: string,
): Promise<string> {
    const bonusPointId = doc(
        collection(db, "houses", houseId, "bonusPoints"),
    ).id;
    const bonusPointDoc = doc(
        db,
        "houses",
        houseId,
        "bonusPoints",
        bonusPointId,
    );

    const bonusPoint: Omit<BonusPoint, "id"> = {
        category,
        points,
        timestamp: new Date(),
        reason,
        addedBy,
    };

    await setDoc(bonusPointDoc, bonusPoint);

    // Update house's bonusPoints and totalPoints
    const houseDocRef = doc(db, "houses", houseId);
    const houseDoc = await getDoc(houseDocRef);

    if (houseDoc.exists()) {
        const houseData = houseDoc.data();
        const newBonusPoints = (houseData.bonusPoints || 0) + points;
        const newTotalPoints = (houseData.studentPoints || 0) + newBonusPoints;

        await setDoc(houseDocRef, {
            bonusPoints: newBonusPoints,
            totalPoints: newTotalPoints,
            [category]: (houseData[category] || 0) + points, // Also update category total
        }, { merge: true });
    } else {
        // Initialize new house document if it doesn't exist
        const houseColorInfo = getHouseColorInfo(houseId);
        await setDoc(houseDocRef, {
            id: houseId,
            name: houseId,
            colorName: houseColorInfo.colorName,
            accentColor: houseColorInfo.accentColor,
            studentPoints: 0,
            bonusPoints: points,
            totalPoints: points,
            place: 0,
            [category]: points,
        }, { merge: true });
    }

    return bonusPointId;
}

export async function getBonusPointsForHouse(
    houseId: string,
): Promise<BonusPoint[]> {
    const bonusPointsQuery = await getDocs(
        collection(db, "houses", houseId, "bonusPoints"),
    );

    return bonusPointsQuery.docs.map(
        (doc) =>
            ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
            }) as BonusPoint,
    );
}

export async function getAllBonusPoints(): Promise<
    Record<string, BonusPoint[]>
> {
    const housesQuery = await getDocs(collection(db, "houses"));
    const allBonusPoints: Record<string, BonusPoint[]> = {};

    for (const houseDoc of housesQuery.docs) {
        const houseId = houseDoc.id;

        allBonusPoints[houseId] = await getBonusPointsForHouse(houseId);
    }

    return allBonusPoints;
}

export async function calculateHouseBonusPoints(
    houseId: string,
): Promise<Record<string, number>> {
    const bonusPoints = await getBonusPointsForHouse(houseId);
    const categoryTotals: Record<string, number> = {};

    bonusPoints.forEach((bp) => {
        categoryTotals[bp.category] =
            (categoryTotals[bp.category] || 0) + bp.points;
    });

    return categoryTotals;
}

export async function clearHouseBonusPoints(houseId: string): Promise<void> {
    const bonusPointsQuery = await getDocs(
        collection(db, "houses", houseId, "bonusPoints"),
    );

    const deletePromises = bonusPointsQuery.docs.map((doc) =>
        deleteDoc(doc.ref),
    );

    await Promise.all(deletePromises);
}

export async function deleteBonusPoint(
    houseId: string,
    bonusPointId: string,
): Promise<void> {
    const bonusPointDoc = doc(
        db,
        "houses",
        houseId,
        "bonusPoints",
        bonusPointId,
    );

    await deleteDoc(bonusPointDoc);
}
