import {
    collection,
    doc,
    getDoc,
    getDocs,
    writeBatch,
} from "@firebase/firestore";

import { db } from "./firebaseApp";
import { PointCategory } from "./firebaseDb";

// Cache keys
const POINT_CATEGORIES_CACHE_KEY = "cgps_point_categories";
const CACHE_VERSION_KEY = "cgps_cache_version";
const CURRENT_CACHE_VERSION = "1.0";

// Point categories caching with localStorage
export async function getCachedPointCategories(): Promise<PointCategory[]> {
    try {
        // Check cache version
        const cacheVersion = localStorage.getItem(CACHE_VERSION_KEY);
        const cachedData = localStorage.getItem(POINT_CATEGORIES_CACHE_KEY);

        if (cacheVersion === CURRENT_CACHE_VERSION && cachedData) {
            return JSON.parse(cachedData);
        }

        // Cache miss or version mismatch - fetch fresh data
        const pointsCategoriesSnapshot = await getDocs(
            collection(db, "pointCategories"),
        );
        const categories = pointsCategoriesSnapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                }) as PointCategory,
        );

        // Update cache
        localStorage.setItem(
            POINT_CATEGORIES_CACHE_KEY,
            JSON.stringify(categories),
        );
        localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);

        return categories;
    } catch (error) {
        console.error("Error fetching cached point categories:", error);
        // Fallback to direct fetch
        const pointsCategoriesSnapshot = await getDocs(
            collection(db, "pointCategories"),
        );

        return pointsCategoriesSnapshot.docs.map(
            (doc) =>
                ({
                    id: doc.id,
                    ...doc.data(),
                }) as PointCategory,
        );
    }
}

// Invalidate point categories cache (call when categories are updated)
export function invalidatePointCategoriesCache(): void {
    localStorage.removeItem(POINT_CATEGORIES_CACHE_KEY);
    localStorage.removeItem(CACHE_VERSION_KEY);
}

// Batch point operations interface
export interface PointUpdate {
    studentId: string;
    house: string;
    category: string;
    points: number;
}

export interface BatchPointResult {
    success: boolean;
    studentsUpdated: number;
    housesUpdated: number;
    error?: string;
}

// Optimized batch point writing
export async function batchWritePoints(
    updates: PointUpdate[],
): Promise<BatchPointResult> {
    try {
        const batch = writeBatch(db);
        const houseUpdates = new Map<string, Map<string, number>>(); // house -> category -> totalPoints

        // Group updates by house to minimize house document updates
        for (const update of updates) {
            // Update individual student
            const studentRef = doc(db, "individuals", update.studentId);
            const studentDoc = await getDoc(studentRef);

            if (studentDoc.exists()) {
                const currentData = studentDoc.data();
                const newCategoryValue =
                    (currentData[update.category] || 0) + update.points;
                const newTotalPoints =
                    (currentData.totalPoints || 0) + update.points;

                batch.update(studentRef, {
                    [update.category]: newCategoryValue,
                    totalPoints: newTotalPoints,
                });

                // Accumulate house updates
                if (!houseUpdates.has(update.house)) {
                    houseUpdates.set(update.house, new Map());
                }
                const houseCategories = houseUpdates.get(update.house)!;

                houseCategories.set(
                    update.category,
                    (houseCategories.get(update.category) || 0) + update.points,
                );
                houseCategories.set(
                    "totalPoints",
                    (houseCategories.get("totalPoints") || 0) + update.points,
                );
            }
        }

        // Apply house updates
        for (const [houseName, categoryUpdates] of houseUpdates) {
            const houseRef = doc(db, "houses", houseName);
            const houseDoc = await getDoc(houseRef);

            if (houseDoc.exists()) {
                const currentData = houseDoc.data();
                const updateData: any = {};

                for (const [category, pointDelta] of categoryUpdates) {
                    updateData[category] =
                        (currentData[category] || 0) + pointDelta;
                }

                batch.update(houseRef, updateData);
            }
        }

        await batch.commit();

        return {
            success: true,
            studentsUpdated: updates.length,
            housesUpdated: houseUpdates.size,
        };
    } catch (error) {
        console.error("Error in batch point write:", error);

        return {
            success: false,
            studentsUpdated: 0,
            housesUpdated: 0,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// Optimized single point write (uses batch internally for consistency)
export async function writePointsOptimized(
    category: string,
    studentId: string,
    points: number,
    house: string,
): Promise<BatchPointResult> {
    const update: PointUpdate = { studentId, house, category, points };

    return batchWritePoints([update]);
}
