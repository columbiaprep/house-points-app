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
    limit,
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

export interface PointEvent {
    id: string;
    studentId: string;
    studentName: string;
    house: string;
    category: string;
    points: number;
    timestamp: Date;
    addedBy: string;
    type: 'individual' | 'bulk' | 'csv';
    batchId?: string;
    metadata?: {
        fileName?: string;
        studentCount?: number;
        totalPoints?: number;
        categories?: string[];
        affectedStudents?: string[];
        [key: string]: any;
    };
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
    try {
        const individualsQuery = await getDocs(collection(db, "individuals"));

        return individualsQuery.docs.map((doc) => {
            const data = doc.data();

            return {
                id: doc.id,
                ...data,
            } as IndividualDocument;
        });
    } catch (error) {
        console.error("fetchAllIndividuals error:", error);
        throw error;
    }
}

// Fetch all houses
export async function fetchAllHouses(): Promise<Array<HouseDocument>> {
    try {
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
    } catch (error) {
        console.error("fetchAllHouses error:", error);
        throw error;
    }
}

// Fetch individual
export async function fetchIndividual(id: string): Promise<IndividualDocument> {
    try {
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
    } catch (error) {
        console.error("fetchIndividual error for", id, ":", error);
        throw error;
    }
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
    addedBy?: string,
) {
    // Fetch the existing individual document
    const individualDocRef = doc(db, "individuals", id);
    const individualDoc = await getDoc(individualDocRef);

    let updateData = { [ptsCategory]: points };
    let houseId = "";
    let studentName = "";

    if (individualDoc.exists()) {
        const individualData = individualDoc.data();
        houseId = individualData.house; // Get house directly from existing data
        studentName = individualData.name || id;

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

    // Log the point event for individual additions
    if (addedBy && houseId && studentName) {
        await logPointEvent({
            studentId: id,
            studentName: studentName,
            house: houseId,
            category: ptsCategory,
            points: points,
            timestamp: new Date(),
            addedBy: addedBy,
            type: 'individual',
        });
    }
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
        // Validate student data before creating documents
        if (!student.id || !student.house || !student.name) {
            console.warn("Skipping invalid student data:", student);
            return;
        }

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

    // Clear all point events to ensure fresh audit trail
    await clearAllPointEvents();

    // Clear all rollback data to reduce storage costs
    await clearAllRollbackData();
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
    try {
        const userDoc = doc(db, "users", email);
        const userDocSnapshot = await getDoc(userDoc);

        if (userDocSnapshot.exists()) {
            const data = userDocSnapshot.data();

            return data?.accountType;
        }

        return null;
    } catch (error) {
        console.error("getUserAccountType error for", email, ":", error);
        // Return null if we can't access the database (permissions, etc.)
        return null;
    }
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

    // First, get the bonus point data to reverse the points
    const bonusDoc = await getDoc(bonusPointDoc);
    if (!bonusDoc.exists()) {
        throw new Error("Bonus point not found");
    }

    const bonusData = bonusDoc.data() as BonusPoint;

    // Update house totals to reverse the bonus points
    const houseRef = doc(db, "houses", houseId);
    const houseDoc = await getDoc(houseRef);

    if (houseDoc.exists()) {
        const houseData = houseDoc.data();
        const newBonusPoints = (houseData.bonusPoints || 0) - bonusData.points;
        const newTotalPoints = (houseData.studentPoints || 0) + newBonusPoints;
        const newCategoryValue = (houseData[bonusData.category] || 0) - bonusData.points;

        await setDoc(houseRef, {
            bonusPoints: Math.max(0, newBonusPoints),
            totalPoints: Math.max(0, newTotalPoints),
            [bonusData.category]: Math.max(0, newCategoryValue),
        }, { merge: true });
    }

    // Delete the bonus point record
    await deleteDoc(bonusPointDoc);
}

// Point Events Functions
export async function logPointEvent(event: Omit<PointEvent, 'id'>): Promise<string> {
    const eventId = doc(collection(db, "pointsEvents")).id;
    const eventDoc = doc(db, "pointsEvents", eventId);

    const eventData: PointEvent = {
        id: eventId,
        ...event,
    };

    await setDoc(eventDoc, eventData);
    return eventId;
}

export async function getAllPointEvents(limitCount: number = 50): Promise<PointEvent[]> {
    console.log(`[getAllPointEvents] Querying pointsEvents collection with limit: ${limitCount}`);
    const eventsQuery = query(
        collection(db, "pointsEvents"),
        orderBy("timestamp", "desc"),
        limit(limitCount),
    );
    const querySnapshot = await getDocs(eventsQuery);

    console.log(`[getAllPointEvents] Found ${querySnapshot.docs.length} documents`);

    const events = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
            timestamp: data.timestamp.toDate(),
        } as PointEvent;
    });

    console.log(`[getAllPointEvents] First few events:`, events.slice(0, 3).map(e => ({
        id: e.id,
        studentId: e.studentId,
        house: e.house,
        category: e.category,
        points: e.points,
        type: e.type,
        batchId: e.batchId,
        timestamp: e.timestamp.toISOString()
    })));

    return events;
}

export async function getPointEventsForStudent(
    studentId: string,
    limitCount: number = 50,
): Promise<PointEvent[]> {
    const eventsQuery = query(
        collection(db, "pointsEvents"),
        where("studentId", "==", studentId),
        orderBy("timestamp", "desc"),
        limit(limitCount),
    );
    const querySnapshot = await getDocs(eventsQuery);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
            timestamp: data.timestamp.toDate(),
        } as PointEvent;
    });
}

export async function getPointEventsForHouse(
    house: string,
    limitCount: number = 50,
): Promise<PointEvent[]> {
    const eventsQuery = query(
        collection(db, "pointsEvents"),
        where("house", "==", house),
        orderBy("timestamp", "desc"),
        limit(limitCount),
    );
    const querySnapshot = await getDocs(eventsQuery);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
            timestamp: data.timestamp.toDate(),
        } as PointEvent;
    });
}

export async function clearAllPointEvents(): Promise<void> {
    const eventsQuery = await getDocs(collection(db, "pointsEvents"));
    const deletePromises = eventsQuery.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
}

export async function clearAllRollbackData(): Promise<void> {
    console.log("Clearing all rollback data to reduce storage costs...");

    // Clear rollback requests
    const rollbackRequestsQuery = await getDocs(collection(db, "rollbackRequests"));
    const deleteRequestsPromises = rollbackRequestsQuery.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deleteRequestsPromises);

    console.log(`Cleared ${rollbackRequestsQuery.docs.length} rollback requests`);

    // Note: Point events are already cleared by clearAllPointEvents()
    // This includes both original events and rollback events
}

// Batch rollback functionality
export interface RollbackPreview {
    batchId: string;
    studentsAffected: number;
    totalPointsToRemove: number;
    pointsToAdd: number;
    breakdown: Record<string, number>;
    detailedChanges: Array<{
        studentId: string;
        studentName: string;
        house: string;
        category: string;
        pointsToChange: number;
        currentPoints?: number;
        afterRollback?: number;
    }>;
    timestamp: Date;
    addedBy: string;
}

export interface RollbackRequest {
    batchId: string;
    requestedBy: string;
    requestTime: Date;
    preview: RollbackPreview;
    status: 'pending_confirmation' | 'confirmed' | 'executed' | 'cancelled';
    confirmationDeadline: Date;
    confirmationCode?: string;
    executedAt?: Date;
    executedBy?: string;
}

export async function getBatchEvents(batchId: string): Promise<PointEvent[]> {
    const eventsQuery = query(
        collection(db, "pointsEvents"),
        where("batchId", "==", batchId),
        where("studentId", "!=", "BULK_OPERATION"), // Only individual events, not summary
        orderBy("studentId"), // Required for != queries
        orderBy("timestamp", "asc")
    );
    const querySnapshot = await getDocs(eventsQuery);

    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            ...data,
            timestamp: data.timestamp.toDate(),
        } as PointEvent;
    });
}

export async function generateRollbackPreview(batchId: string): Promise<RollbackPreview | null> {
    // Get batch summary event first to get metadata
    const summaryQuery = query(
        collection(db, "pointsEvents"),
        where("batchId", "==", batchId),
        where("studentId", "==", "BULK_OPERATION")
    );
    const summarySnapshot = await getDocs(summaryQuery);

    if (summarySnapshot.empty) {
        return null;
    }

    const summaryEvent = summarySnapshot.docs[0].data() as PointEvent;

    // Get individual events
    const events = await getBatchEvents(batchId);

    if (events.length === 0) {
        return null;
    }

    // Calculate preview data
    const totalPointsToRemove = events.filter(e => e.points > 0).reduce((sum, e) => sum + e.points, 0);
    const pointsToAdd = events.filter(e => e.points < 0).reduce((sum, e) => sum + Math.abs(e.points), 0);

    const breakdown: Record<string, number> = {};
    events.forEach(event => {
        breakdown[event.category] = (breakdown[event.category] || 0) + 1;
    });

    // Get current points for each student to show before/after
    const detailedChanges = [];
    for (const event of events) {
        try {
            const studentDoc = await getDoc(doc(db, "individuals", event.studentId));
            const currentPoints = studentDoc.exists() ? (studentDoc.data()[event.category] || 0) : 0;

            detailedChanges.push({
                studentId: event.studentId,
                studentName: event.studentName,
                house: event.house,
                category: event.category,
                pointsToChange: -event.points, // Negative because we're reversing
                currentPoints: currentPoints,
                afterRollback: Math.max(0, currentPoints - event.points), // Don't go negative
            });
        } catch (error) {
            console.warn(`Could not get current points for student ${event.studentId}:`, error);
            detailedChanges.push({
                studentId: event.studentId,
                studentName: event.studentName,
                house: event.house,
                category: event.category,
                pointsToChange: -event.points,
            });
        }
    }

    return {
        batchId,
        studentsAffected: events.length,
        totalPointsToRemove,
        pointsToAdd,
        breakdown,
        detailedChanges,
        timestamp: summaryEvent.timestamp.toDate(),
        addedBy: summaryEvent.addedBy,
    };
}

function generateConfirmationCode(batchId: string): string {
    // Generate a simple 6-character confirmation code based on batchId
    const hash = batchId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
}

export async function requestBatchRollback(batchId: string, requestedBy: string): Promise<RollbackRequest> {
    const preview = await generateRollbackPreview(batchId);
    if (!preview) {
        throw new Error("Batch not found or has no individual events to rollback");
    }

    // Check if batch was already rolled back
    const existingRequest = await getRollbackRequest(batchId);
    if (existingRequest?.status === 'executed') {
        throw new Error("This batch has already been rolled back");
    }

    const request: RollbackRequest = {
        batchId,
        requestedBy,
        requestTime: new Date(),
        preview,
        status: 'pending_confirmation',
        confirmationDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        confirmationCode: generateConfirmationCode(batchId),
    };

    await setDoc(doc(db, "rollbackRequests", batchId), request);
    return request;
}

export async function getRollbackRequest(batchId: string): Promise<RollbackRequest | null> {
    const requestDoc = await getDoc(doc(db, "rollbackRequests", batchId));
    if (!requestDoc.exists()) {
        return null;
    }

    const data = requestDoc.data();
    return {
        ...data,
        requestTime: data.requestTime.toDate(),
        confirmationDeadline: data.confirmationDeadline.toDate(),
        executedAt: data.executedAt?.toDate(),
    } as RollbackRequest;
}

export async function confirmBatchRollback(
    batchId: string,
    confirmingAdmin: string,
    confirmationCode: string
): Promise<void> {
    const request = await getRollbackRequest(batchId);
    if (!request) {
        throw new Error("Rollback request not found");
    }

    if (request.status !== 'pending_confirmation') {
        throw new Error(`Cannot confirm rollback with status: ${request.status}`);
    }

    if (Date.now() > request.confirmationDeadline.getTime()) {
        throw new Error("Confirmation deadline has passed");
    }

    // Check cooling-off period (30 minutes minimum)
    const coolingOffPeriod = 30 * 60 * 1000; // 30 minutes
    if (Date.now() - request.requestTime.getTime() < coolingOffPeriod) {
        const remainingMinutes = Math.ceil((coolingOffPeriod - (Date.now() - request.requestTime.getTime())) / (60 * 1000));
        throw new Error(`Must wait ${remainingMinutes} more minutes before confirming rollback`);
    }

    if (confirmationCode !== request.confirmationCode) {
        throw new Error("Invalid confirmation code");
    }

    // Execute the rollback
    await executeBatchRollback(batchId, confirmingAdmin);

    // Update request status
    await setDoc(doc(db, "rollbackRequests", batchId), {
        ...request,
        status: 'executed',
        executedAt: new Date(),
        executedBy: confirmingAdmin,
    });
}

async function executeBatchRollback(batchId: string, executedBy: string): Promise<void> {
    const events = await getBatchEvents(batchId);

    if (events.length === 0) {
        throw new Error("No events found for this batch");
    }

    console.log(`Executing rollback for batch ${batchId} with ${events.length} events`);

    // Process rollback in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < events.length; i += batchSize) {
        const batchEvents = events.slice(i, i + batchSize);
        const batch = writeBatch(db);

        for (const event of batchEvents) {
            try {
                // Reverse student points
                const studentRef = doc(db, "individuals", event.studentId);
                const studentDoc = await getDoc(studentRef);

                if (studentDoc.exists()) {
                    const currentData = studentDoc.data();
                    const newCategoryValue = Math.max(0, (currentData[event.category] || 0) - event.points);
                    const newTotalValue = Math.max(0, (currentData.totalPoints || 0) - event.points);

                    batch.update(studentRef, {
                        [event.category]: newCategoryValue,
                        totalPoints: newTotalValue,
                    });
                }

                // Reverse house points
                const housesQuery = query(
                    collection(db, "houses"),
                    where("name", "==", event.house)
                );
                const housesSnapshot = await getDocs(housesQuery);

                if (!housesSnapshot.empty) {
                    const houseDoc = housesSnapshot.docs[0];
                    const houseData = houseDoc.data();
                    const newCategoryValue = Math.max(0, (houseData[event.category] || 0) - event.points);
                    const newStudentPoints = Math.max(0, (houseData.studentPoints || 0) - event.points);
                    const newTotalPoints = newStudentPoints + (houseData.bonusPoints || 0);

                    batch.update(houseDoc.ref, {
                        [event.category]: newCategoryValue,
                        studentPoints: newStudentPoints,
                        totalPoints: newTotalPoints,
                    });
                }

                // Log rollback event
                const rollbackEventId = doc(collection(db, "pointsEvents")).id;
                batch.set(doc(db, "pointsEvents", rollbackEventId), {
                    id: rollbackEventId,
                    studentId: event.studentId,
                    studentName: event.studentName,
                    house: event.house,
                    category: event.category,
                    points: -event.points, // Negative to indicate rollback
                    timestamp: new Date(),
                    addedBy: executedBy,
                    type: 'rollback',
                    batchId: `rollback_${batchId}`,
                    metadata: {
                        originalEventId: event.id,
                        originalBatchId: batchId,
                        rollbackReason: 'batch_rollback',
                    },
                });

            } catch (error) {
                console.error(`Error rolling back event ${event.id}:`, error);
                // Continue with other events rather than failing entire rollback
            }
        }

        await batch.commit();
        console.log(`Completed rollback batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(events.length/batchSize)}`);
    }

    console.log(`Rollback completed for batch ${batchId}`);
}

export async function getAllRollbackRequests(): Promise<RollbackRequest[]> {
    const requestsQuery = query(
        collection(db, "rollbackRequests"),
        orderBy("requestTime", "desc")
    );
    const querySnapshot = await getDocs(requestsQuery);

    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            requestTime: data.requestTime.toDate(),
            confirmationDeadline: data.confirmationDeadline.toDate(),
            executedAt: data.executedAt?.toDate(),
        } as RollbackRequest;
    });
}

export async function deletePointEvent(eventId: string): Promise<void> {
    // First, get the event data to reverse the points
    const eventRef = doc(db, "pointsEvents", eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
        throw new Error("Point event not found");
    }

    const eventData = eventDoc.data() as PointEvent;

    // Don't allow deletion of bulk operations for safety
    if (eventData.type === 'bulk' || eventData.type === 'csv') {
        throw new Error("Cannot delete bulk operations. Use 'mark as deleted' instead.");
    }

    // For individual events, reverse the points
    if (eventData.studentId && eventData.studentId !== 'BULK_OPERATION') {
        const studentRef = doc(db, "individuals", eventData.studentId);
        const studentDoc = await getDoc(studentRef);

        if (studentDoc.exists()) {
            const currentData = studentDoc.data();
            const newCategoryValue = (currentData[eventData.category] || 0) - eventData.points;
            const newTotalPoints = (currentData.totalPoints || 0) - eventData.points;

            // Update student data
            await setDoc(studentRef, {
                [eventData.category]: Math.max(0, newCategoryValue), // Don't allow negative
                totalPoints: Math.max(0, newTotalPoints),
            }, { merge: true });

            // Update house data
            const houseRef = doc(db, "houses", eventData.house);
            const houseDoc = await getDoc(houseRef);

            if (houseDoc.exists()) {
                const houseData = houseDoc.data();
                const newHouseCategoryValue = (houseData[eventData.category] || 0) - eventData.points;
                const newStudentPoints = (houseData.studentPoints || 0) - eventData.points;
                const newTotalPoints = newStudentPoints + (houseData.bonusPoints || 0);

                await setDoc(houseRef, {
                    [eventData.category]: Math.max(0, newHouseCategoryValue),
                    studentPoints: Math.max(0, newStudentPoints),
                    totalPoints: Math.max(0, newTotalPoints),
                }, { merge: true });
            }
        }
    }

    // Delete the event
    await deleteDoc(eventRef);
}
