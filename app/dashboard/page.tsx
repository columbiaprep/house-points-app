"use client";
import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { useRouter } from "next/navigation";

import { AchievementsContainer } from "@/components/achievements";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
    const user = useAuth();
    const router = useRouter();
    const userData = user.user;
    const accountType = user.accountType;
    const userDbData = user.userDbData;

    return (
        <>
            <Card className="p-2 m-2">
                <CardHeader className="flex justify-center">
                    <h1 className="text-2xl font-bold text-center">
                        My Dashboard
                    </h1>
                </CardHeader>
                <CardBody>
                    {/* Buttons with links, different for account tiers */}
                    <>
                        {accountType == "student" && (
                            <div className="flex flex-row gap-2">
                                <Card className="p-6 h-auto">
                                    <h2 className="text-xl font-bold">
                                        {userData?.displayName}'s Points
                                        Breakdown
                                    </h2>
                                    <Divider />
                                    <p>
                                        Attending Events Points:{" "}
                                        {userDbData?.attendingEventsPts}
                                    </p>
                                    <p>
                                        Caught Being Good Points:{" "}
                                        {userDbData?.beingGoodPts}
                                    </p>
                                    <p>
                                        Sports Team Points:{" "}
                                        {userDbData?.sportsTeamPts}
                                    </p>
                                    <p>
                                        Total Points: {userDbData?.totalPoints}
                                    </p>
                                </Card>
                                <AchievementsContainer />
                                <div className="flex flex-wrap flex-row gap-2">
                                    <Button
                                        className="w-max"
                                        color="primary"
                                        onPress={() => router.push("/")}
                                    >
                                        Points & Leaderboards
                                    </Button>
                                </div>
                            </div>
                        )}
                        {accountType == "admin" && (
                            <Button
                                color="primary"
                                onPress={() => router.push("/admin")}
                            >
                                Admin Dashboard
                            </Button>
                        )}
                    </>
                </CardBody>
            </Card>
        </>
    );
};

export default Dashboard;
