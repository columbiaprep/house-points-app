"use client";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { HousePointsContainer } from "@/components/house-leaderboard";
import { StudentLeaderboardContainer } from "@/components/student-leaderboard";
import { HouseBarChart } from "@/components/house-bar-chart";

const Dashboard = () => {
    const user = useAuth();
    const router = useRouter();
    const userData = user.user;
    const accountType = user.accountType;
    const student = user.userDbData;
    const isAdmin = accountType === "admin";
    const isTeacher = accountType === "teacher";
    const loading = user.loading;

    // Show loading while authentication is being resolved
    if (loading) {
        return (
            <Card className="">
                <CardHeader className="flex justify-center">
                    <h1 className="text-2xl font-bold text-center">
                        House Points Dashboard
                    </h1>
                </CardHeader>
                <CardBody>
                    <div className="text-center">
                        <p>Loading your data...</p>
                    </div>
                </CardBody>
            </Card>
        );
    }

    // Redirect to auth if not authenticated
    if (!userData) {
        router.push("/auth");
        return null;
    }

    return (
        <Card className="">
            <CardHeader className="flex justify-start">
                <h1 className="text-sm text-gray-500 text-left font-bold italic">
                    House Points Dashboard
                </h1>
            </CardHeader>
            <CardBody>
                {student != null || isAdmin || isTeacher ? (
                    <>
                        <div className="w-full max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                                <div className="lg:col-span-2 w-full">
                                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 font-mono">
                                        House Leaderboard
                                    </h2>
                                    <HousePointsContainer />
                                </div>
                                <div className="lg:col-span-1 w-full">
                                    <HouseBarChart />
                                    <StudentLeaderboardContainer />
                                </div>
                            </div>
                        </div>
                        {isAdmin && (
                            <div className="mt-6 text-center">
                                <Button
                                    color="primary"
                                    onPress={() => router.push("/admin")}
                                >
                                    Admin Dashboard
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center">
                        <p>Loading your data...</p>
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default Dashboard;
