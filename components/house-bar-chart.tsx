import { useState, useEffect } from "react";
import { Spinner } from "@heroui/react";

import { HouseDocument } from "@/firebase-configuration/firebaseDb";
import { useHouseSummaries } from "@/hooks/useFirebaseData";
import { useAuth } from "@/contexts/AuthContext";

interface HouseBarProps {
    house: HouseDocument;
    maxPoints: number;
    rank: number;
}

const HouseBar: React.FC<HouseBarProps> = ({ house, maxPoints, rank }) => {
    const colorMapping: Record<string, string> = {
        blue: "bg-blue-500",
        yellow: "bg-yellow-500",
        green: "bg-green-500",
        orange: "bg-orange-500",
        pink: "bg-pink-500",
        purple: "bg-purple-500",
        red: "bg-red-500",
        slate: "bg-slate-500",
    };

    const houseColor = colorMapping[house.colorName] || colorMapping.slate;
    const barHeight = maxPoints > 0 ? (house.totalPoints / maxPoints) * 100 : 0;

    const formatPoints = (points: number) => {
        if (points >= 1000) {
            return `${(points / 1000).toFixed(0)}k`;
        }
        return points.toString();
    };

    return (
        <div className="flex flex-col items-center">
            <div className="w-8 h-32 bg-gray-200 rounded-md relative overflow-hidden flex flex-col justify-end">
                <div
                    className={`w-full ${houseColor} rounded-md transition-all duration-500 ease-out flex items-center justify-center relative`}
                    style={{ height: `${Math.max(barHeight, 20)}%` }}
                >
                    {barHeight > 40 && (
                        <span className="text-xs font-bold text-white text-center leading-none transform -rotate-90 whitespace-nowrap">
                            {formatPoints(house.totalPoints)}
                        </span>
                    )}
                </div>
            </div>
            <div className="mt-1">
                <span className="text-xs font-bold font-mono text-gray-700">
                    {rank}
                </span>
            </div>
        </div>
    );
};

export const HouseBarChart = () => {
    const [houses, setHouses] = useState<HouseDocument[]>([]);
    const auth = useAuth();
    const isAuthenticated = !!auth.user && !auth.loading;

    const { data: housesData, isLoading: loading, error } = useHouseSummaries(isAuthenticated);

    useEffect(() => {
        if (housesData) {
            // Sort houses by total points (descending)
            const sortedHouses = [...housesData].sort((a, b) => b.totalPoints - a.totalPoints);
            setHouses(sortedHouses);
        }
    }, [housesData]);

    if (error) {
        console.error("Error loading house data:", error);
        return (
            <div className="text-center text-red-500">
                Error loading house data
            </div>
        );
    }

    const maxPoints = houses.length > 0 ? Math.max(...houses.map(h => h.totalPoints)) : 1;

    return (
        <div className="w-full mb-6">
            <h3 className="text-base sm:text-lg font-bold text-center mb-4 font-mono">
                House Totals
            </h3>
            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <Spinner
                        classNames={{ label: "text-foreground mt-4" }}
                        label="Loading house data..."
                        variant="wave"
                    />
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-center items-end gap-1">
                        {houses.map((house, index) => (
                            <HouseBar
                                key={house.id || house.name || index}
                                house={house}
                                maxPoints={maxPoints}
                                rank={index + 1}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};