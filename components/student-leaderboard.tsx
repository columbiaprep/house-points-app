import { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";

import { IndividualDocument } from "@/firebase-configuration/firebaseDb";
import {
    useIndividuals,
    useHouseSummaries,
    usePointCategories,
} from "@/hooks/useFirebaseData";

interface StudentLeaderboardRowProps extends IndividualDocument {
    rank: number;
    totalPoints: number;
    houseColorName?: string;
    houseAccentColor?: string;
}

export const StudentLeaderboardRow: React.FC<StudentLeaderboardRowProps> = ({
    rank,
    name,
    house,
    totalPoints,
    houseColorName,
    houseAccentColor,
}) => {
    // Multiple solutions to ensure house colors work
    const getHouseStyles = () => {
        // Solution 1: Use actual house color data if available
        if (houseColorName && houseAccentColor) {
            // Create a safe mapping to ensure Tailwind classes exist
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

        // Solution 2: Fallback using house name
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
            houseNameMapping[house] ||
            "bg-gradient-to-r from-gray-400 to-gray-700 shadow-gray-500/50"
        );
    };

    const gradientClasses = getHouseStyles();

    return (
        <div
            className={`flex items-center rounded-xl mb-2 px-3 py-2 min-h-16 shadow-lg ${gradientClasses}`}
        >
            <div className="flex-shrink-0 w-8 text-center text-lg font-mono font-bold">
                {rank}
            </div>

            <div className="flex-grow px-2 min-w-0">
                <p className="text-sm font-mono font-bold truncate">{name}</p>
                <p className="text-xs text-gray-700 truncate">{house}</p>
            </div>

            <div className="flex-shrink-0 text-right">
                <p className="text-lg font-mono font-bold">{totalPoints}</p>
                <p className="text-xs text-gray-700">pts</p>
            </div>
        </div>
    );
};

export const StudentLeaderboardContainer = () => {
    const [topStudents, setTopStudents] = useState<IndividualDocument[]>([]);

    const { data: allStudents, isLoading: studentsLoading } = useIndividuals();
    const { data: houses } = useHouseSummaries();
    const { data: categories, isLoading: categoriesLoading } =
        usePointCategories();

    const loading = studentsLoading || categoriesLoading;

    useEffect(() => {
        if (allStudents && categories) {
            // Use the totalPoints field directly from the student documents
            // Individual documents already have totalPoints calculated and stored
            const studentsWithTotals = allStudents.map((student) => ({
                ...student,
                totalPoints: student.totalPoints || 0, // Use existing totalPoints field
            }));

            // Sort by total points (descending) and take top 10
            const top10 = studentsWithTotals
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .slice(0, 10);

            setTopStudents(top10);
        }
    }, [allStudents, categories]);

    return (
        <div className="w-full">
            <h2 className="text-xl font-bold text-center mb-4 font-mono">
                🏆 TOP 10 STUDENTS 🏆
            </h2>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner
                        classNames={{ label: "text-foreground mt-4" }}
                        label="wave"
                        variant="wave"
                    />
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div
                        className="w-full max-h-96 overflow-y-auto pr-1"
                        style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#9ca3af #e5e7eb",
                        }}
                    >
                        {topStudents.map((student, index) => {
                            // Find matching house data for color information
                            const matchingHouse = houses?.find(
                                (house) => house.name === student.house,
                            );

                            return (
                                <StudentLeaderboardRow
                                    key={student.id}
                                    houseAccentColor={
                                        matchingHouse?.accentColor
                                    }
                                    houseColorName={matchingHouse?.colorName}
                                    rank={index + 1}
                                    totalPoints={student.totalPoints}
                                    {...student}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
