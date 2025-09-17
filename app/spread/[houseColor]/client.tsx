"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Switch, Slider } from "@heroui/react";

import { useAuth } from "@/contexts/AuthContext";
import PointsChartData from "@/components/pointsChart";
import {
    generateHouseChartData,
    generatePersonalChartData,
} from "@/components/chartDataUtils";
import { generateMockPersonalChartData } from "@/components/mockStudentData";
import { NearbyRankingsContainer } from "@/components/nearby-rankings";
import { fetchIndividual } from "@/firebase-configuration/firebaseDb";

interface HouseSpreadPageClientProps {
    houseColor: string;
}

const HouseSpreadPageClient = ({ houseColor }: HouseSpreadPageClientProps) => {
    const { user, accountType } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [chartDataState, setChartDataState] = useState<any>(null);
    const [testMode, setTestMode] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [housecolor] = useState(houseColor);
    const [viewPersonal, setViewPersonal] = useState(false);
    const [mockPersonalData, setMockPersonalData] = useState<any>(null);
    const [averageScore, setAverageScore] = useState(100);

    console.log(user?.email);

    useEffect(() => {
        if (accountType === "admin") {
            setIsAdmin(true);
        }
    }, [accountType]);

    useEffect(() => {
        const loadChartData = async () => {
            setLoading(true);
            console.log("Loading chart data for house:", housecolor);

            try {
                if (testMode) {
                    console.log("Test mode enabled");
                    if (viewPersonal && user?.email) {
                        console.log(
                            "Generating mock personal data for:",
                            user.email,
                        );
                        const mockData = generateMockPersonalChartData(
                            user.email,
                        );

                        console.log("Generated mock personal data:", mockData);
                        setMockPersonalData(mockData);
                        setChartDataState(null);
                    } else {
                        console.log(
                            "Generating mock house data for:",
                            housecolor,
                        );
                        const houseChartData =
                            await generateHouseChartData(housecolor);

                        console.log(
                            "Generated house chart data:",
                            houseChartData,
                        );
                        setChartDataState(houseChartData);
                        setMockPersonalData(null);
                    }
                } else {
                    console.log("Test mode disabled, fetching real data");
                    const houseChartData =
                        await generateHouseChartData(housecolor);

                    console.log("Generated house chart data:", houseChartData);
                    setChartDataState(houseChartData);

                    if (viewPersonal && user?.email) {
                        console.log(
                            "Fetching personal data for email:",
                            user.email,
                        );
                        try {
                            const individualData = await fetchIndividual(
                                user.email,
                            );

                            console.log(
                                "Fetched individual data:",
                                individualData,
                            );

                            if (individualData) {
                                const personalChartData =
                                    await generatePersonalChartData(
                                        user.email,
                                        housecolor,
                                    );

                                console.log(
                                    "Generated personal chart data:",
                                    personalChartData,
                                );
                                setChartDataState(personalChartData);
                            }
                        } catch (error) {
                            console.error(
                                "Error fetching individual data:",
                                error,
                            );
                            // Fallback to house data
                            const houseChartData =
                                await generateHouseChartData(housecolor);

                            setChartDataState(houseChartData);
                        }
                    } else {
                        console.log("Using house chart data");
                        setChartDataState(houseChartData);
                    }
                }
            } catch (error) {
                console.error("Error in loadChartData:", error);
            } finally {
                setLoading(false);
            }
        };

        loadChartData();
    }, [housecolor, user?.email, testMode, isAdmin]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading chart data...</div>
            </div>
        );
    }

    const displayData =
        testMode && viewPersonal ? mockPersonalData : chartDataState;

    return (
        <>
            <div className="min-h-screen p-4">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <Button
                            color="primary"
                            variant="flat"
                            onClick={() => router.push("/")}
                        >
                            ← Back to Dashboard
                        </Button>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-center mb-6">
                            {housecolor.charAt(0).toUpperCase() +
                                housecolor.slice(1)}{" "}
                            House Points Breakdown
                        </h1>

                        {isAdmin && (
                            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    Admin Controls
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <Switch
                                        isSelected={testMode}
                                        onValueChange={setTestMode}
                                    >
                                        Test Mode
                                    </Switch>
                                    {testMode && (
                                        <>
                                            <Switch
                                                isSelected={viewPersonal}
                                                onValueChange={setViewPersonal}
                                            >
                                                View Personal Data
                                            </Switch>
                                            {viewPersonal && (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium">
                                                        Average Score:
                                                    </span>
                                                    <Slider
                                                        className="max-w-md"
                                                        maxValue={500}
                                                        minValue={0}
                                                        showTooltip={true}
                                                        size="sm"
                                                        step={10}
                                                        value={averageScore}
                                                        onChange={(value) =>
                                                            setAverageScore(
                                                                Array.isArray(
                                                                    value,
                                                                )
                                                                    ? value[0]
                                                                    : value,
                                                            )
                                                        }
                                                    />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                                                        {averageScore}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid lg:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                                <h2 className="text-xl font-semibold mb-4 text-center">
                                    Points Distribution
                                </h2>
                                {displayData ? (
                                    <PointsChartData
                                        data={displayData}
                                        title="Points Distribution"
                                        type="doughnut"
                                    />
                                ) : (
                                    <div className="flex justify-center items-center h-64">
                                        <div className="text-gray-500">
                                            No chart data available
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                                <h2 className="text-xl font-semibold mb-4 text-center">
                                    House Rankings
                                </h2>
                                <div className="max-h-96 overflow-y-auto">
                                    <NearbyRankingsContainer
                                        currentStudentEmail={user?.email || ""}
                                        houseFilter={housecolor}
                                        testMode={testMode}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HouseSpreadPageClient;
