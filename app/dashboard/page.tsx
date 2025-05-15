"use client";
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { HousePointsContainer } from "@/components/house-leaderboard";
import { useEffect, useState } from "react";
import { fetchIndividual, IndividualDocument } from "@/firebase-configuration/firebaseDb";

const Dashboard = () => {
    const user = useAuth();
    const router = useRouter();
    const userData = user.user;
    const accountType = user.accountType;
    const userDbData = user.userDbData;

    const [student, setStudent] = useState<IndividualDocument>();

    useEffect(() => {
        if (accountType == "student" && user.user?.email != null) {
            fetchIndividual(user.user?.email)
                .then((user) => {
                    setStudent(user)
                })
        }
    }, [])

    return (
        <>
            <Card className="">
                <CardHeader className="flex justify-center">
                    <h1 className="text-2xl font-bold text-center">
                        House Points Dashboard
                    </h1>
                </CardHeader>
                <CardBody>
                    {(student != undefined) ?                 
                    <HousePointsContainer student={student} id={student.id} name={student.name} grade={student.grade} house={student.house} houseRank={student.houseRank}/>
                    : <></>
                    }
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
        </>
    );
};

export default Dashboard;
