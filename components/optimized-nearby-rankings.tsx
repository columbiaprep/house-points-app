import { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";

import {
    fetchNearbyRankings,
    StudentRanking,
    HouseSummary,
    fetchHouseSummariesWithFallback,
} from "@/firebase-configuration/optimizedFirebaseDb";

interface OptimizedNearbyRankingsRowProps {
    rank: number;
    student: StudentRanking;
    totalPoints: number;
    isCurrentStudent: boolean;
    houseColorName?: string;
    houseAccentColor?: string;
}

export const OptimizedNearbyRankingsRow: React.FC<
    OptimizedNearbyRankingsRowProps
> = ({
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
                silver: "bg-gradient-to-r from-gray-400 to-gray-700 shadow-gray-500/50",
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

interface OptimizedNearbyRankingsContainerProps {
    currentStudentEmail: string;
    houseFilter: string;
    testMode?: boolean;
    testPoints?: number;
}

export const OptimizedNearbyRankingsContainer: React.FC<
    OptimizedNearbyRankingsContainerProps
> = ({
    currentStudentEmail,
    houseFilter,
    testMode = false,
    testPoints = 150,
}) => {
    const [nearbyStudents, setNearbyStudents] = useState<StudentRanking[]>([]);
    const [houses, setHouses] = useState<HouseSummary[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchNearbyStudents = async () => {
            setLoading(true);
            try {
                if (testMode) {
                    // For test mode, you might want to generate mock data
                    // This is a simplified version - you can enhance as needed
                    console.log("Test mode: generating mock nearby rankings");
                    setNearbyStudents([]);

                    return;
                }

                // Fetch houses for color data
                const housesData = await fetchHouseSummariesWithFallback();

                setHouses(housesData);

                // Fetch nearby rankings using optimized function
                const nearbyRankings = await fetchNearbyRankings(
                    houseFilter,
                    currentStudentEmail,
                    2, // Range: 2 students above and below
                );

                setNearbyStudents(nearbyRankings);

                if (nearbyRankings.length > 0) {
                    console.log(
                        `📊 Loaded ${nearbyRankings.length} nearby rankings (optimized)`,
                    );
                }
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
                    {nearbyStudents.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                            {testMode
                                ? "Test mode: No rankings to display"
                                : "No ranking data available"}
                        </div>
                    ) : (
                        <div className="w-full space-y-2">
                            {nearbyStudents.map((student) => {
                                // Find matching house data for color information
                                const matchingHouse = houses.find(
                                    (house) => house.name === student.house,
                                );
                                const isCurrentStudent =
                                    student.id === currentStudentEmail;

                                return (
                                    <OptimizedNearbyRankingsRow
                                        key={student.id}
                                        houseAccentColor={
                                            matchingHouse?.accentColor
                                        }
                                        houseColorName={
                                            matchingHouse?.colorName
                                        }
                                        isCurrentStudent={isCurrentStudent}
                                        rank={student.houseRank}
                                        student={student}
                                        totalPoints={student.totalPoints}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
