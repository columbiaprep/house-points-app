import { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";
import { collection, getDocs } from "@firebase/firestore";

import {
    fetchAllIndividuals,
    IndividualDocument,
    HouseDocument,
    fetchAllHouses,
} from "@/firebase-configuration/firebaseDb";
import { db } from "@/firebase-configuration/firebaseApp";

interface NearbyRankingsRowProps {
    rank: number;
    student: IndividualDocument;
    totalPoints: number;
    isCurrentStudent: boolean;
    houseColorName?: string;
    houseAccentColor?: string;
}

export const NearbyRankingsRow: React.FC<NearbyRankingsRowProps> = ({
    rank,
    student,
    totalPoints,
    isCurrentStudent,
    houseColorName,
    houseAccentColor,
}) => {
    const getHouseStyles = () => {
        if (houseColorName && houseAccentColor) {
            const colorMapping: Record<string, string> = {
                blue: "bg-gradient-to-r from-blue-400 to-blue-700 shadow-blue-500/50",
                yellow: "bg-gradient-to-r from-yellow-400 to-yellow-700 shadow-yellow-500/50",
                green: "bg-gradient-to-r from-green-400 to-green-700 shadow-green-500/50",
                orange: "bg-gradient-to-r from-orange-400 to-orange-700 shadow-orange-500/50",
                pink: "bg-gradient-to-r from-pink-400 to-pink-700 shadow-pink-500/50",
                purple: "bg-gradient-to-r from-purple-400 to-purple-700 shadow-purple-500/50",
                red: "bg-gradient-to-r from-red-400 to-red-700 shadow-red-500/50",
                gray: "bg-gradient-to-r from-gray-400 to-gray-700 shadow-gray-500/50",
            };

            const mappedColor =
                colorMapping[houseColorName.toLowerCase()] ||
                colorMapping["gray"];

            return mappedColor;
        }

        const houseNameMapping: Record<string, string> = {
            "Blue House":
                "bg-gradient-to-r from-blue-400 to-blue-700 shadow-blue-500/50",
            "Gold House":
                "bg-gradient-to-r from-yellow-400 to-yellow-700 shadow-yellow-500/50",
            "Green House":
                "bg-gradient-to-r from-green-400 to-green-700 shadow-green-500/50",
            "Orange House":
                "bg-gradient-to-r from-orange-400 to-orange-700 shadow-orange-500/50",
            "Pink House":
                "bg-gradient-to-r from-pink-400 to-pink-700 shadow-pink-500/50",
            "Purple House":
                "bg-gradient-to-r from-purple-400 to-purple-700 shadow-purple-500/50",
            "Red House":
                "bg-gradient-to-r from-red-400 to-red-700 shadow-red-500/50",
            "Silver House":
                "bg-gradient-to-r from-gray-400 to-gray-700 shadow-gray-500/50",
            Blue: "bg-gradient-to-r from-blue-400 to-blue-700 shadow-blue-500/50",
            Gold: "bg-gradient-to-r from-yellow-400 to-yellow-700 shadow-yellow-500/50",
            Green: "bg-gradient-to-r from-green-400 to-green-700 shadow-green-500/50",
            Orange: "bg-gradient-to-r from-orange-400 to-orange-700 shadow-orange-500/50",
            Pink: "bg-gradient-to-r from-pink-400 to-pink-700 shadow-pink-500/50",
            Purple: "bg-gradient-to-r from-purple-400 to-purple-700 shadow-purple-500/50",
            Red: "bg-gradient-to-r from-red-400 to-red-700 shadow-red-500/50",
            Silver: "bg-gradient-to-r from-gray-400 to-gray-700 shadow-gray-500/50",
        };

        return (
            houseNameMapping[student.house] ||
            "bg-gradient-to-r from-gray-400 to-gray-700 shadow-gray-500/50"
        );
    };

    const gradientClasses = getHouseStyles();
    const outlineClasses = isCurrentStudent
        ? "ring-4 ring-yellow-400 ring-opacity-75"
        : "";

    return (
        <div
            className={`flex items-center rounded-xl mb-2 px-4 py-3 min-h-16 shadow-lg ${gradientClasses} ${outlineClasses}`}
        >
            <div className="flex-shrink-0 w-12 text-center text-xl font-mono font-bold">
                {rank}
            </div>

            <div className="flex-grow px-3 min-w-0">
                <p className="text-lg font-mono font-bold truncate">
                    {student.name} {isCurrentStudent && "(You)"}
                </p>
                <p className="text-sm text-gray-100 truncate">
                    {student.house}
                </p>
            </div>

            <div className="flex-shrink-0 text-right">
                <p className="text-xl font-mono font-bold">{totalPoints}</p>
                <p className="text-sm text-gray-100">pts</p>
            </div>
        </div>
    );
};

interface NearbyRankingsContainerProps {
    currentStudentEmail: string;
    houseFilter: string;
    testMode?: boolean;
    testPoints?: number;
}

export const NearbyRankingsContainer: React.FC<
    NearbyRankingsContainerProps
> = ({
    currentStudentEmail,
    houseFilter,
    testMode = false,
    testPoints = 150,
}) => {
    const [nearbyStudents, setNearbyStudents] = useState<
        (IndividualDocument & { totalPoints: number; globalRank: number })[]
    >([]);
    const [houses, setHouses] = useState<HouseDocument[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchNearbyStudents = async () => {
            setLoading(true);
            try {
                if (testMode) {
                    // Use real data but inject test points for current user

                    // Get point categories first
                    const pointCategoriesSnapshot = await getDocs(
                        collection(db, "pointCategories"),
                    );
                    const categories = pointCategoriesSnapshot.docs.map((doc) =>
                        doc.data(),
                    );

                    // Fetch houses for color data
                    const housesData = await fetchAllHouses();

                    setHouses(housesData);

                    // Fetch all individuals
                    const allStudents = await fetchAllIndividuals();

                    // Calculate total points for each student using proper point categories
                    const studentsWithTotals = allStudents.map((student) => {
                        let total = 0;

                        categories.forEach((category) => {
                            total += student[category.key] || 0;
                        });

                        // If this is the current user in test mode, use test points
                        if (student.id === currentStudentEmail) {
                            total = testPoints;
                        }

                        return {
                            ...student,
                            totalPoints: total,
                        };
                    });

                    // Filter students by house
                    const houseFilteredStudents = houseFilter
                        ? studentsWithTotals.filter(
                              (student) => student.house === houseFilter,
                          )
                        : studentsWithTotals;

                    // Sort by total points (descending) to create house-specific rankings
                    const houseRankings = houseFilteredStudents
                        .sort((a, b) => b.totalPoints - a.totalPoints)
                        .map((student, index) => ({
                            ...student,
                            houseRank: index + 1,
                        }));

                    // Find the current student's position in house rankings
                    const currentStudentIndex = houseRankings.findIndex(
                        (student) => student.id === currentStudentEmail,
                    );

                    if (currentStudentIndex === -1) {
                        // If current user not found, create a test user and insert them
                        const testUser = {
                            id: currentStudentEmail,
                            name: "Test User (You)",
                            grade: 11,
                            house: houseFilter,
                            totalPoints: testPoints,
                            houseRank: 1, // Will be recalculated
                        };

                        // Add test user and re-sort
                        const allStudentsWithTest = [
                            ...houseFilteredStudents,
                            testUser,
                        ];
                        const reRankedStudents = allStudentsWithTest
                            .sort((a, b) => b.totalPoints - a.totalPoints)
                            .map((student, index) => ({
                                ...student,
                                houseRank: index + 1,
                            }));

                        const testUserIndex = reRankedStudents.findIndex(
                            (student) => student.id === currentStudentEmail,
                        );

                        // Get 2 students above, current student, and 2 students below
                        const start = Math.max(0, testUserIndex - 2);
                        const end = Math.min(
                            reRankedStudents.length,
                            testUserIndex + 3,
                        );
                        const nearbyRankings = reRankedStudents.slice(
                            start,
                            end,
                        );

                        setNearbyStudents(nearbyRankings);
                    } else {
                        // Current user found, show nearby rankings
                        const start = Math.max(0, currentStudentIndex - 2);
                        const end = Math.min(
                            houseRankings.length,
                            currentStudentIndex + 3,
                        );
                        const nearbyRankings = houseRankings.slice(start, end);

                        setNearbyStudents(nearbyRankings);
                    }

                    return;
                }

                // Use real data (non-test mode)
                // Get point categories first
                const pointCategoriesSnapshot = await getDocs(
                    collection(db, "pointCategories"),
                );
                const categories = pointCategoriesSnapshot.docs.map((doc) =>
                    doc.data(),
                );

                // Fetch houses for color data
                const housesData = await fetchAllHouses();

                setHouses(housesData);

                // Fetch all individuals
                const allStudents = await fetchAllIndividuals();

                // Calculate total points for each student using proper point categories
                const studentsWithTotals = allStudents.map((student) => {
                    let total = 0;

                    categories.forEach((category) => {
                        total += student[category.key] || 0;
                    });

                    return {
                        ...student,
                        totalPoints: total,
                    };
                });

                // Filter students by house if houseFilter is provided
                const houseFilteredStudents = houseFilter
                    ? studentsWithTotals.filter(
                          (student) => student.house === houseFilter,
                      )
                    : studentsWithTotals;

                // Sort by total points (descending) to create house-specific rankings
                const houseRankings = houseFilteredStudents
                    .sort((a, b) => b.totalPoints - a.totalPoints)
                    .map((student, index) => ({
                        ...student,
                        houseRank: index + 1,
                    }));

                // Find the current student's position in house rankings
                const currentStudentIndex = houseRankings.findIndex(
                    (student) => student.id === currentStudentEmail,
                );

                if (currentStudentIndex === -1) {
                    console.log(
                        "Current student not found in house rankings, component will not display",
                    );
                    setNearbyStudents([]);

                    return;
                }

                // Get 2 students above, current student, and 2 students below
                const start = Math.max(0, currentStudentIndex - 2);
                const end = Math.min(
                    houseRankings.length,
                    currentStudentIndex + 3,
                );
                const nearbyRankings = houseRankings.slice(start, end);

                setNearbyStudents(nearbyRankings);
            } catch (error) {
                console.error("Error fetching nearby students:", error);
            } finally {
                setLoading(false);
            }
        };

        if (currentStudentEmail && houseFilter) {
            fetchNearbyStudents();
        }
    }, [currentStudentEmail, houseFilter, testMode, testPoints]);

    return (
        <div className="w-full">
            <h2 className="text-xl font-bold text-center mb-4 font-mono">
                🎯 YOUR RANKING 🎯{testMode && " (Test Mode)"}
            </h2>
            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Spinner
                        classNames={{ label: "text-foreground mt-4" }}
                        label="wave"
                        variant="wave"
                    />
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="w-full space-y-2">
                        {nearbyStudents.map((student) => {
                            // Find matching house data for color information
                            const matchingHouse = houses.find(
                                (house) => house.name === student.house,
                            );
                            const isCurrentStudent =
                                student.id === currentStudentEmail;

                            return (
                                <NearbyRankingsRow
                                    key={student.id}
                                    houseAccentColor={
                                        matchingHouse?.accentColor
                                    }
                                    houseColorName={matchingHouse?.colorName}
                                    isCurrentStudent={isCurrentStudent}
                                    rank={student.houseRank}
                                    student={student}
                                    totalPoints={student.totalPoints}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
