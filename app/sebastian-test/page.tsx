"use client";
import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { AchievementsContainer } from "@/components/achievements";
import { pointsCategories } from "@/firebase-configuration/firebaseDb";
import { HousePointsContainer } from "@/components/housePointsComponent";

const SebastianTest = () => {
    const router = useRouter();

    return (
        <>
            <h1>HI</h1>
            <HousePointsContainer />
        </>
    );
};

export default SebastianTest;
