"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import PointsChartData from "@/components/pointsChart";
import {
    generateHouseChartData,
    generatePersonalChartData,
} from "@/components/chartDataUtils";

const HouseSpreadPage = () => {
    //use params returns the string in the URL
    const { houseColor } = useParams();
    const { user, userDbData: student } = useAuth();
    const housecolor =
        typeof houseColor === "string" ? houseColor.toLowerCase() : "";

    // State for chart data
    const [houseChartData, setHouseChartData] = useState<any>(null);
    const [personalChartData, setPersonalChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadChartData = async () => {
            if (!housecolor || !user?.email) return;

            try {
                setLoading(true);
                // Load both house and personal chart data
                const [houseData, personalData] = await Promise.all([
                    generateHouseChartData(housecolor),
                    generatePersonalChartData(user.email, housecolor),
                ]);

                setHouseChartData(houseData);
                setPersonalChartData(personalData);
            } catch (error) {
                console.error("Error loading chart data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadChartData();
    }, [housecolor, user?.email]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading chart data...</div>
            </div>
        );
    }

    return (
        <div>
            <h1>I have {student?.totalPoints} total points</h1>
            <h1>I am in {houseColor} house</h1>

            <div
                className={`bg-${housecolor}-200 grid place-items-center font-mono font-bold text-3xl`}
            >
                <div>
                    <p className="grid place-items-center">HOUSE SPREAD</p>
                    {houseChartData && (
                        <PointsChartData
                            data={houseChartData}
                            title="House Points Spread"
                            type="doughnut"
                        />
                    )}
                </div>

                <div>
                    <p className="grid place-items-center mt-10">
                        Personal Spread
                    </p>
                    {personalChartData && (
                        <PointsChartData
                            data={personalChartData}
                            title="Personal Points Spread"
                            type="pie"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default HouseSpreadPage;
