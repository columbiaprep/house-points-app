"use client";
import { useRouter } from "next/navigation";

import { HousePointsContainer } from "@/components/sebastian-house-points";

const SebastianTest = () => {
    const router = useRouter();

    return (
        <>
            <HousePointsContainer />
        </>
    );
};

export default SebastianTest;
