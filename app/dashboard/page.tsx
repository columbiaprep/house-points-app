"use client";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { HousePointsContainer } from "@/components/house-leaderboard";

const Dashboard = () => {
    const user = useAuth();
    const router = useRouter();
    const userData = user.user;
    const accountType = "student"; //TODO: Change back after testing
    const student = user.userDbData;
    const userEmail = "szack25@cgps.org"; //TODO: Change back after testing

    return (
        <Card className="">
            <CardHeader className="flex justify-center">
                <h1 className="text-2xl font-bold text-center">
                    House Points Dashboard
                </h1>
            </CardHeader>
            <CardBody>
                {student != null ? (
                    <>
                        <HousePointsContainer />
                        <p>{student.name}</p>
                    </>
                ) : (
                    <></>
                )}
                {accountType == "admin" && (
                    <Button
                        color="primary"
                        onPress={() => router.push("/admin")}
                    >
                        Admin Dashboard
                    </Button>
                )}
            </CardBody>
        </Card>
    );
};

export default Dashboard;
