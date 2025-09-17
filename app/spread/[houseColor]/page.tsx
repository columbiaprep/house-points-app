"use client";
import { useParams, useRouter } from "next/navigation";
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
import {
    fetchIndividual,
    fetchAllHouses,
} from "@/firebase-configuration/firebaseDb";


const HouseSpreadPage = () => {
    //use params returns the string in the URL
    const { houseColor } = useParams();
    const { user, accountType } = useAuth();
    const router = useRouter();
    const housecolor =
        typeof houseColor === "string" ? houseColor.toLowerCase() : "";

    const handleBackToLeaderboard = () => {
        router.push("/dashboard");
    };

    // State for chart data
    const [houseChartData, setHouseChartData] = useState<any>(null);
    const [personalChartData, setPersonalChartData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [testMode, setTestMode] = useState(false);
    const [userHouse, setUserHouse] = useState<string | null>(null);
    const [rankingsTestMode, setRankingsTestMode] = useState(false);
    const [testPoints, setTestPoints] = useState(150);

    const isAdmin = accountType === "admin";

    // Fetch user's house information
    useEffect(() => {
        const fetchUserHouse = async () => {
            if (!user?.email || !accountType) {
                console.log("No user email found or account type not loaded yet");

                return;
            }

            console.log("Fetching house for user:", user.email, "accountType:", accountType);

            // Skip individual lookup for admins
            if (accountType === "admin") {
                console.log("User is admin, using URL house color");
                const fallbackHouseMap: { [key: string]: string } = {
                    blue: "Blue House",
                    gold: "Gold House",
                    green: "Green House",
                    orange: "Orange House",
                    pink: "Pink House",
                    purple: "Purple House",
                    red: "Red House",
                    silver: "Silver House",
                };
                const fallbackHouse = fallbackHouseMap[housecolor] || "Blue House";
                setUserHouse(fallbackHouse);
                return;
            }

            try {
                const userInfo = await fetchIndividual(user.email);

                console.log("User info retrieved:", userInfo);

                if (userInfo.house) {
                    setUserHouse(userInfo.house);
                    console.log("Set userHouse to:", userInfo.house);
                } else {
                    console.log(
                        "User has no house assigned, using fallback for admin",
                    );
                    // User exists but has no house - use fallback for admin testing
                    if (isAdmin && housecolor) {
                        // Fetch houses to get real house names that match the color
                        try {
                            const housesData = await fetchAllHouses();

                            console.log("Available houses:", housesData);

                            // Try to find a house that matches the color from URL
                            const matchingHouse = housesData.find(
                                (house) =>
                                    house.name
                                        .toLowerCase()
                                        .includes(housecolor) ||
                                    house.colorName?.toLowerCase() ===
                                        housecolor,
                            );

                            if (matchingHouse) {
                                console.log(
                                    "Found matching house:",
                                    matchingHouse.name,
                                );
                                setUserHouse(matchingHouse.name);
                            } else {
                                // Fallback to first house if no match
                                const fallbackHouse =
                                    housesData[0]?.name || "Blue House";

                                console.log(
                                    "No matching house found, using first available:",
                                    fallbackHouse,
                                );
                                setUserHouse(fallbackHouse);
                            }
                        } catch (error) {
                            console.error(
                                "Error fetching houses for fallback:",
                                error,
                            );
                            // Ultimate fallback
                            setUserHouse("Blue House");
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching user house:", error);
                // For testing purposes, let's use the house color from URL as fallback
                if (isAdmin && housecolor) {
                    const fallbackHouseMap: { [key: string]: string } = {
                        blue: "Blue House",
                        gold: "Gold House",
                        green: "Green House",
                        orange: "Orange House",
                        pink: "Pink House",
                        purple: "Purple House",
                        red: "Red House",
                        silver: "Silver House",
                    };
                    const fallbackHouse =
                        fallbackHouseMap[housecolor] || "Blue House";

                    console.log(
                        "Using fallback house for admin (error case):",
                        fallbackHouse,
                    );
                    setUserHouse(fallbackHouse);
                }
            }
        };

        fetchUserHouse();
    }, [user?.email, accountType, housecolor]);

    useEffect(() => {
        const loadChartData = async () => {
            if (!housecolor || !user?.email || !accountType) return;

            try {
                setLoading(true);

                // Load house data (always real)
                const houseData = await generateHouseChartData(housecolor);
                console.log("House chart data loaded:", houseData);

                setHouseChartData(houseData);

                // Load personal data (real or mock based on test mode and user type)
                let personalData;

                if (testMode && isAdmin) {
                    // Use mock data when test mode is enabled for admins
                    personalData = generateMockPersonalChartData(housecolor);
                } else if (isAdmin) {
                    // For admins when test mode is off, show a default message or empty state
                    personalData = null;
                } else {
                    // Use real data for students
                    personalData = await generatePersonalChartData(
                        user.email,
                        housecolor,
                    );
                }

                setPersonalChartData(personalData);
            } catch (error) {
                console.error("Error loading chart data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadChartData();
    }, [housecolor, user?.email, testMode, accountType]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading chart data...</div>
            </div>
        );
    }

    return (
        <>
            {/* Back Button - Fixed position relative to viewport */}
            <div className="fixed top-24 left-10 z-50">
                <Button
                    className="bg-white/90 text-gray-800 hover:bg-white shadow-lg"
                    color="primary"
                    size="sm"
                    variant="solid"
                    onPress={handleBackToLeaderboard}
                >
                    ← Back to Leaderboard
                </Button>
            </div>

            {/* Admin Test Mode Toggle - Fixed position relative to viewport */}
            {isAdmin && (
                <div className="fixed top-24 right-10 z-50 space-y-3">
                    <div className="bg-white/90 p-3 rounded-lg shadow-lg">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                                Test Student Mode
                            </span>
                            <Switch
                                color="primary"
                                isSelected={testMode}
                                size="sm"
                                onValueChange={setTestMode}
                            />
                        </div>
                        {testMode && (
                            <p className="text-xs text-gray-500 mt-1">
                                Showing mock student data
                            </p>
                        )}
                    </div>

                    <div className="bg-white/90 p-3 rounded-lg shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                Test Rankings Mode
                            </span>
                            <Switch
                                color="secondary"
                                isSelected={rankingsTestMode}
                                size="sm"
                                onValueChange={setRankingsTestMode}
                            />
                        </div>
                        {rankingsTestMode && (
                            <div className="space-y-2">
                                <p className="text-xs text-gray-500">
                                    Showing mock ranking data
                                </p>
                                <div className="w-full">
                                    <label className="text-xs font-medium text-gray-600 block mb-1">
                                        Test Points: {testPoints}
                                    </label>
                                    <Slider
                                        className="w-full"
                                        color="secondary"
                                        maxValue={500}
                                        minValue={0}
                                        size="sm"
                                        step={10}
                                        value={testPoints}
                                        onChange={(value) =>
                                            setTestPoints(value as number)
                                        }
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Full-width background container - break out of layout constraints */}
            <div className="fixed inset-0 top-20 overflow-auto">
                <div className={`bg-${housecolor}-200 min-h-full w-full py-24`}>
                    {/* Grid layout for charts and leaderboard */}
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 px-6">
                        {/* House Spread Chart */}
                        <div className="flex flex-col items-center">
                            <p className="grid place-items-center font-mono font-bold text-3xl mb-6">
                                HOUSE SPREAD
                            </p>
                            {houseChartData ? (
                                <PointsChartData
                                    data={houseChartData}
                                    title="House Points Spread"
                                    type="doughnut"
                                />
                            ) : (
                                <div className="text-center p-8 bg-gray-100 rounded-lg">
                                    <p className="text-gray-600 text-lg mb-2">
                                        No points have been added for this house yet
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Points will appear here once activities are recorded
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Personal Spread Chart */}
                        <div className="flex flex-col items-center">
                            <p className="grid place-items-center font-mono font-bold text-3xl mb-6">
                                Personal Spread{" "}
                                {testMode && isAdmin && "(Test Data)"}
                            </p>
                            {personalChartData ? (
                                <PointsChartData
                                    data={personalChartData}
                                    title={`Personal Points Spread${testMode && isAdmin ? " (Test Data)" : ""}`}
                                    type="pie"
                                />
                            ) : isAdmin && !testMode ? (
                                <div className="text-center p-8 bg-gray-100 rounded-lg">
                                    <p className="text-gray-600 mb-2">
                                        Personal data not available for admin accounts
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Toggle "Test Student Mode" to see sample data
                                    </p>
                                </div>
                            ) : null}
                        </div>

                        {/* Nearby Rankings Leaderboard */}
                        <div className="flex flex-col items-center">
                            <div className="w-full max-w-sm">
                                {user?.email && userHouse && (isAdmin || userHouse.toLowerCase().includes(housecolor)) && (
                                    <NearbyRankingsContainer
                                        currentStudentEmail={user.email}
                                        houseFilter={userHouse}
                                        testMode={rankingsTestMode && isAdmin}
                                        testPoints={testPoints}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HouseSpreadPage;
