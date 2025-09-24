import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    limit,
} from "@firebase/firestore";

import { db } from "./firebaseApp";

// Optimized interfaces for aggregated data
export interface HouseSummary {
    name: string;
    totalPoints: number;
    bonusPoints: number;
    colorName: string;
    accentColor: string;
    place: number;
    lastUpdated: any;
    [key: string]: any;
}

export interface StudentRanking {
    id: string;
    name: string;
    grade: number;
    house: string;
    totalPoints: number;
    houseRank: number;
    globalRank: number;
    lastUpdated: any;
    [key: string]: any;
}

// OPTIMIZED: Fetch house summaries (reduces ~8 reads to 8 reads but pre-calculated)
export async function fetchHouseSummaries(): Promise<HouseSummary[]> {
    const summariesQuery = query(
        collection(db, "houseSummaries"),
        orderBy("totalPoints", "desc"),
    );
    const querySnapshot = await getDocs(summariesQuery);

    return querySnapshot.docs.map((doc) => doc.data() as HouseSummary);
}

// OPTIMIZED: Fetch house rankings for specific house (reduces 400+ reads to ~50)
export async function fetchHouseRankings(
    houseName: string,
    limitCount: number = 50,
): Promise<StudentRanking[]> {
    const rankingsQuery = query(
        collection(db, "houseRankings", houseName, "students"),
        orderBy("houseRank", "asc"),
        limit(limitCount),
    );
    const querySnapshot = await getDocs(rankingsQuery);

    return querySnapshot.docs.map((doc) => doc.data() as StudentRanking);
}

// OPTIMIZED: Fetch nearby rankings for a specific student
export async function fetchNearbyRankings(
    houseName: string,
    currentStudentId: string,
    range: number = 2,
): Promise<StudentRanking[]> {
    try {
        // First, get the current student's ranking
        const currentStudentDoc = await getDoc(
            doc(db, "houseRankings", houseName, "students", currentStudentId),
        );

        if (!currentStudentDoc.exists()) {
            return [];
        }

        const currentStudent = currentStudentDoc.data() as StudentRanking;
        const currentRank = currentStudent.houseRank;

        // Get students in range
        const allRankingsQuery = query(
            collection(db, "houseRankings", houseName, "students"),
            orderBy("houseRank", "asc"),
        );
        const allRankingsSnapshot = await getDocs(allRankingsQuery);
        const allRankings = allRankingsSnapshot.docs.map(
            (doc) => doc.data() as StudentRanking,
        );

        // Find current student index and return nearby students
        const currentIndex = allRankings.findIndex(
            (student) => student.id === currentStudentId,
        );

        if (currentIndex === -1) return [];

        const start = Math.max(0, currentIndex - range);
        const end = Math.min(allRankings.length, currentIndex + range + 1);

        return allRankings.slice(start, end);
    } catch (error) {
        console.error("Error fetching nearby rankings:", error);

        return [];
    }
}

// OPTIMIZED: Get specific student ranking data
export async function fetchStudentRanking(
    houseName: string,
    studentId: string,
): Promise<StudentRanking | null> {
    try {
        const studentDoc = await getDoc(
            doc(db, "houseRankings", houseName, "students", studentId),
        );

        if (!studentDoc.exists()) {
            return null;
        }

        return studentDoc.data() as StudentRanking;
    } catch (error) {
        console.error("Error fetching student ranking:", error);

        return null;
    }
}

// OPTIMIZED: Get house-specific data for chart generation
export async function fetchHouseChartData(
    houseColorName: string,
): Promise<HouseSummary | null> {
    try {
        // Try to find house by colorName first
        const summariesSnapshot = await getDocs(
            collection(db, "houseSummaries"),
        );
        const houseSummary = summariesSnapshot.docs.find((doc) => {
            const data = doc.data();

            return (
                data.colorName === houseColorName ||
                data.name.includes(houseColorName)
            );
        });

        if (houseSummary) {
            return houseSummary.data() as HouseSummary;
        }

        return null;
    } catch (error) {
        console.error("Error fetching house chart data:", error);

        return null;
    }
}

// OPTIMIZED: Get student's personal data for chart generation
export async function fetchStudentChartData(
    studentId: string,
    houseName: string,
): Promise<StudentRanking | null> {
    return await fetchStudentRanking(houseName, studentId);
}

// Utility function to check if aggregated data is stale (older than 5 minutes)
export function isDataStale(timestamp: any): boolean {
    if (!timestamp) return true;

    const now = new Date().getTime();
    const dataTime = timestamp.toDate
        ? timestamp.toDate().getTime()
        : timestamp;
    const fiveMinutes = 5 * 60 * 1000;

    return now - dataTime > fiveMinutes;
}

// Fallback functions that use original queries if aggregated data is missing/stale
export async function fetchHouseSummariesWithFallback(): Promise<
    HouseSummary[]
> {
    try {
        const summaries = await fetchHouseSummaries();

        // Check if data exists and is recent
        if (summaries.length > 0 && !isDataStale(summaries[0].lastUpdated)) {
            return summaries;
        }

        // Fallback to original fetchAllHouses
        console.warn(
            "Using fallback: fetching houses from original collection",
        );
        const { fetchAllHouses, calculateHouseBonusPoints } = await import("./firebaseDb");
        const houses = await fetchAllHouses();

        // Convert to HouseSummary format using new architecture
        const summariesWithBonus = houses.map((house) => {
            return {
                name: house.name,
                totalPoints: house.totalPoints || 0, // Use the calculated totalPoints directly
                bonusPoints: house.bonusPoints || 0, // Use the stored bonusPoints directly
                colorName: house.colorName,
                accentColor: house.accentColor,
                place: house.place || 0,
                lastUpdated: new Date(),
                ...Object.fromEntries(
                    Object.entries(house).filter(
                        ([key]) =>
                            ![
                                "id",
                                "name",
                                "totalPoints",
                                "bonusPoints",
                                "studentPoints",
                                "colorName",
                                "accentColor",
                                "place",
                            ].includes(key),
                    ),
                ),
            };
        });

        // Re-sort by totalPoints (including bonus) and update places
        summariesWithBonus.sort((a, b) => b.totalPoints - a.totalPoints);
        summariesWithBonus.forEach((house, index) => {
            house.place = index + 1;
        });

        return summariesWithBonus;
    } catch (error) {
        console.error("Error in fetchHouseSummariesWithFallback:", error);
        throw error;
    }
}

// Migration helper: Check if aggregated collections exist
export async function checkAggregatedCollectionsExist(): Promise<{
    houseSummaries: boolean;
    houseRankings: boolean;
}> {
    try {
        // Check house summaries
        const summariesSnapshot = await getDocs(
            query(collection(db, "houseSummaries"), limit(1)),
        );

        // Check house rankings - need to look for any house with students subcollection
        let houseRankingsExist = false;

        // Get a list of house names from summaries to check for rankings
        const summariesData = summariesSnapshot.docs.map((doc) => doc.data());

        if (summariesData.length > 0) {
            const houseName = summariesData[0].name;
            const studentsSnapshot = await getDocs(
                query(
                    collection(db, "houseRankings", houseName, "students"),
                    limit(1),
                ),
            );

            houseRankingsExist = !studentsSnapshot.empty;
        }

        return {
            houseSummaries: !summariesSnapshot.empty,
            houseRankings: houseRankingsExist,
        };
    } catch (error) {
        console.error("Error checking aggregated collections:", error);

        return { houseSummaries: false, houseRankings: false };
    }
}
