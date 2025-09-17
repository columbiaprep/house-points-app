"use client";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { HousePointsContainer } from "@/components/house-leaderboard";
import { StudentLeaderboardContainer } from "@/components/student-leaderboard";

const Dashboard = () => {
    const user = useAuth();
    const router = useRouter();
    const userData = user.user;
    const accountType = user.accountType;
    const student = user.userDbData;
    const isAdmin = accountType === "admin";

    return (
        <Card className="">
            <CardHeader className="flex justify-center">
                <h1 className="text-2xl font-bold text-center">
                    House Points Dashboard
                </h1>
            </CardHeader>
            <CardBody>
                {student != null || isAdmin ? (
                    <>
                        <div className="w-full max-w-7xl mx-auto">
                            <div className="grid lg:grid-cols-3 gap-6 items-start">
                                <div className="lg:col-span-2 w-full">
                                    <h2 className="text-xl font-bold text-center mb-4 font-mono">
                                        🏠 HOUSE LEADERBOARD 🏠
                                    </h2>
                                    <HousePointsContainer />
                                </div>
                                <div className="lg:col-span-1 w-full">
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
