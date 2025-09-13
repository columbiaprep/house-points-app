import { useQuery, UseQueryResult } from "@tanstack/react-query";

import {
    fetchAllHouses,
    fetchAllIndividuals,
    IndividualDocument,
    HouseDocument,
} from "@/firebase-configuration/firebaseDb";
import {
    fetchHouseSummariesWithFallback,
    fetchHouseRankings,
    fetchNearbyRankings,
    fetchStudentRanking,
    HouseSummary,
    StudentRanking,
} from "@/firebase-configuration/optimizedFirebaseDb";
import {
    getCachedPointCategories,
    PointCategory,
} from "@/firebase-configuration/cachedFirebaseDb";

// Query keys for consistency
export const QUERY_KEYS = {
    houses: ["houses"],
    houseSummaries: ["houseSummaries"],
    individuals: ["individuals"],
    houseRankings: (house: string) => ["houseRankings", house],
    nearbyRankings: (house: string, studentId: string) => [
        "nearbyRankings",
        house,
        studentId,
    ],
    studentRanking: (house: string, studentId: string) => [
        "studentRanking",
        house,
        studentId,
    ],
    pointCategories: ["pointCategories"],
} as const;

// House data hooks
export function useHouses(): UseQueryResult<HouseDocument[], Error> {
    return useQuery({
        queryKey: QUERY_KEYS.houses,
        queryFn: fetchAllHouses,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useHouseSummaries(): UseQueryResult<HouseSummary[], Error> {
    return useQuery({
        queryKey: QUERY_KEYS.houseSummaries,
        queryFn: fetchHouseSummariesWithFallback,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Individual data hooks
export function useIndividuals(): UseQueryResult<IndividualDocument[], Error> {
    return useQuery({
        queryKey: QUERY_KEYS.individuals,
        queryFn: fetchAllIndividuals,
        staleTime: 2 * 60 * 1000, // 2 minutes (more dynamic data)
    });
}

// Optimized ranking hooks
export function useHouseRankings(
    houseName: string,
    limitCount: number = 50,
): UseQueryResult<StudentRanking[], Error> {
    return useQuery({
        queryKey: [...QUERY_KEYS.houseRankings(houseName), limitCount],
        queryFn: () => fetchHouseRankings(houseName, limitCount),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!houseName,
    });
}

export function useNearbyRankings(
    houseName: string,
    studentId: string,
    range: number = 2,
): UseQueryResult<StudentRanking[], Error> {
    return useQuery({
        queryKey: [...QUERY_KEYS.nearbyRankings(houseName, studentId), range],
        queryFn: () => fetchNearbyRankings(houseName, studentId, range),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!houseName && !!studentId,
    });
}

export function useStudentRanking(
    houseName: string,
    studentId: string,
): UseQueryResult<StudentRanking | null, Error> {
    return useQuery({
        queryKey: QUERY_KEYS.studentRanking(houseName, studentId),
        queryFn: () => fetchStudentRanking(houseName, studentId),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!houseName && !!studentId,
    });
}

// Point categories with localStorage caching
export function usePointCategories(): UseQueryResult<PointCategory[], Error> {
    return useQuery({
        queryKey: QUERY_KEYS.pointCategories,
        queryFn: getCachedPointCategories,
        staleTime: 30 * 60 * 1000, // 30 minutes (very stable data)
        gcTime: 60 * 60 * 1000, // 1 hour
    });
}
